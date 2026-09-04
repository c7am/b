// Recolors Lucide SVG icons to the Catppuccin Mocha palette and rasterizes
// them to PNG, ready for scripts/upload-emojis.js to push to Discord as
// application emojis. Run this whenever ICON_SET changes.
//
// Requires: rsvg-convert on PATH (apt install librsvg2-bin / brew install librsvg)

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const LUCIDE_DIR = path.join(__dirname, '..', 'node_modules', 'lucide-static', 'icons');
const SVG_OUT_DIR = path.join(__dirname, '..', 'assets', 'icons-raw');
const PNG_OUT_DIR = path.join(__dirname, '..', 'assets', 'icons-png');

// Every icon renders in this single neutral grey (Catppuccin Mocha
// "Overlay2") instead of a different accent color per icon. Semantic color
// still exists - it just lives in the container accent colors (COLORS in
// src/config.js: red for demote, green for success, etc) - so the icon
// glyphs themselves stay calm, consistent, and don't fight the accent bar.
// To try a different shade: swap this one value and re-run the script.
// Other Mocha neutrals if you want it lighter/darker:
//   overlay1 '#7f849c' (darker/more muted) | overlay2 '#9399b2' (current)
//   subtext0 '#a6adc8' (lighter, closer to body text color)
const GREY = '#9399b2';

// name -> { file: lucide icon filename (no .svg), color?: hex override }
// `color` is optional - omit it to use GREY. Only set it if one specific
// icon genuinely needs to break from the rest.
const ICON_SET = {
  success: { file: 'check-circle' },
  error: { file: 'x-circle' },
  warning: { file: 'triangle-alert' },
  info: { file: 'info' },
  promote: { file: 'arrow-up-circle' },
  demote: { file: 'arrow-down-circle' },
  infract: { file: 'gavel' },
  history: { file: 'scroll-text' },
  ticket: { file: 'ticket' },
  ticket_open: { file: 'door-open' },
  ticket_closed: { file: 'lock' },
  vote: { file: 'vote' },
  vote_yes: { file: 'thumbs-up' },
  config: { file: 'settings' },
  staff: { file: 'users' },
  general: { file: 'file-text' },
  management: { file: 'shield-alert' },
  partnership: { file: 'handshake' },
  ownership: { file: 'crown' },
  loa: { file: 'calendar-clock' },
  transcript: { file: 'file-text' },
};

fs.mkdirSync(SVG_OUT_DIR, { recursive: true });
fs.mkdirSync(PNG_OUT_DIR, { recursive: true });

let ok = 0;
let failed = 0;

for (const [name, { file, color }] of Object.entries(ICON_SET)) {
  const srcPath = path.join(LUCIDE_DIR, `${file}.svg`);
  if (!fs.existsSync(srcPath)) {
    console.error(`[fail] ${name}: lucide-static has no icon named "${file}"`);
    failed++;
    continue;
  }

  let svg = fs.readFileSync(srcPath, 'utf8');
  const hex = color || GREY;

  svg = svg
    .replace(/stroke="currentColor"/g, `stroke="${hex}"`)
    .replace(/stroke-width="2"/g, 'stroke-width="2.5"');

  const svgPath = path.join(SVG_OUT_DIR, `${name}.svg`);
  fs.writeFileSync(svgPath, svg);

  const pngPath = path.join(PNG_OUT_DIR, `${name}.png`);
  try {
    execFileSync('rsvg-convert', ['-w', '128', '-h', '128', '-o', pngPath, svgPath]);
    console.log(`[ok] ${name} <- ${file}.svg (${hex})`);
    ok++;
  } catch (err) {
    console.error(`[fail] ${name}: rsvg-convert error: ${err.message}`);
    failed++;
  }
}

console.log(`\n${ok} icon(s) rendered, ${failed} failed.`);
console.log(`PNGs are in ${PNG_OUT_DIR}`);
console.log('Next: node scripts/upload-emojis.js (requires DISCORD_TOKEN and CLIENT_ID in .env)');
