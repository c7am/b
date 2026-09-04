// Uploads the PNGs from assets/icons-png/ to Discord as application emojis,
// then writes src/generated/icons.json with the resulting {name, id, tag}
// for each. Run this after scripts/prepare-icons.js.
//
// Needs DISCORD_TOKEN and CLIENT_ID in .env. Safe to re-run: existing emojis
// with matching names are left alone and reused, only new ones get created.
//
// IMPORTANT: Discord's application emoji API has no "update image" endpoint -
// the PATCH endpoint only supports renaming, not swapping the picture. That
// means after changing an icon's color and regenerating its PNG (e.g. via
// prepare-icons.js), a normal re-run of this script will NOT pick up the
// change - it'll see the name already exists and reuse the OLD emoji as-is.
// To actually push new artwork live, run with --force: this deletes any
// existing emoji whose name matches one we're about to upload, then creates
// a fresh one (which gets a new ID - icons.json gets rewritten either way,
// so nothing else needs to change).
//
//   node scripts/upload-emojis.js            # normal run, reuses existing
//   node scripts/upload-emojis.js --force     # delete + recreate everything

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const FORCE = process.argv.includes('--force');
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env. Set both before running this script.');
  process.exit(1);
}

const PNG_DIR = path.join(__dirname, '..', 'assets', 'icons-png');
const OUT_PATH = path.join(__dirname, '..', 'src', 'generated', 'icons.json');
const API_BASE = `https://discord.com/api/v10/applications/${CLIENT_ID}/emojis`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function listExistingEmojis() {
  const res = await fetch(API_BASE, {
    headers: { Authorization: `Bot ${TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to list existing emojis: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.items || data; // API has returned either shape across versions
}

async function deleteEmoji(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bot ${TOKEN}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
}

async function createEmoji(name, pngPath) {
  const base64 = fs.readFileSync(pngPath).toString('base64');
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, image: `data:image/png;base64,${base64}` }),
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  if (!fs.existsSync(PNG_DIR)) {
    console.error(`No PNGs found at ${PNG_DIR}. Run scripts/prepare-icons.js first.`);
    process.exit(1);
  }

  const files = fs.readdirSync(PNG_DIR).filter((f) => f.endsWith('.png'));
  if (!files.length) {
    console.error(`${PNG_DIR} is empty. Run scripts/prepare-icons.js first.`);
    process.exit(1);
  }

  if (FORCE) {
    console.log('--force set: existing emojis with matching names will be deleted and recreated.\n');
  }

  console.log('Checking for existing application emojis...');
  const existing = await listExistingEmojis();
  const existingByName = new Map(existing.map((e) => [e.name, e]));

  const result = {};
  let created = 0;
  let updated = 0;
  let reused = 0;
  let failed = 0;

  for (const file of files) {
    const name = path.basename(file, '.png');

    if (existingByName.has(name) && !FORCE) {
      const e = existingByName.get(name);
      result[name] = { id: e.id, name: e.name, tag: `<:${e.name}:${e.id}>` };
      console.log(`[reuse] ${name} (already uploaded, use --force to refresh)`);
      reused++;
      continue;
    }

    try {
      if (existingByName.has(name) && FORCE) {
        await deleteEmoji(existingByName.get(name).id);
        await sleep(350);
      }

      const emoji = await createEmoji(name, path.join(PNG_DIR, file));
      result[name] = { id: emoji.id, name: emoji.name, tag: `<:${emoji.name}:${emoji.id}>` };
      if (existingByName.has(name)) {
        console.log(`[updated] ${name} -> ${emoji.id} (old emoji deleted, new artwork live)`);
        updated++;
      } else {
        console.log(`[ok] ${name} -> ${emoji.id}`);
        created++;
      }
    } catch (err) {
      console.error(`[fail] ${name}: ${err.message}`);
      failed++;
    }

    await sleep(350); // be polite about rate limits
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));

  console.log(`\n${created} created, ${updated} updated, ${reused} reused, ${failed} failed.`);
  console.log(`Written to ${OUT_PATH}`);
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error('Upload failed:', err.message);
  process.exit(1);
});
