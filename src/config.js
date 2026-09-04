const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Catppuccin Mocha palette (https://catppuccin.com/palette/) as Discord-ready
// integer colors, for container accent colors.
const COLORS = {
  rosewater: 0xf5e0dc,
  flamingo: 0xf2cdcd,
  pink: 0xf5c2e7,
  mauve: 0xcba6f7,
  red: 0xf38ba8,
  maroon: 0xeba0ac,
  peach: 0xfab387,
  yellow: 0xf9e2af,
  green: 0xa6e3a1,
  teal: 0x94e2d5,
  sky: 0x89dceb,
  sapphire: 0x74c7ec,
  blue: 0x89b4fa,
  lavender: 0xb4befe,
  text: 0xcdd6f4,
  overlay1: 0x7f849c,
  surface0: 0x313244,
  base: 0x1e1e2e,
};

// Custom Lucide-based application emojis. scripts/prepare-icons.js recolors
// and rasterizes them; scripts/upload-emojis.js pushes them to Discord and
// writes this file. Until that's been run, icon() and iconEmoji() fall back
// to nothing rather than crash, so the bot still works, just without icons.
const generatedPath = path.join(__dirname, 'generated', 'icons.json');
let ICONS = {};
if (fs.existsSync(generatedPath)) {
  ICONS = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
} else {
  console.warn(
    '[config] src/generated/icons.json not found. Run scripts/prepare-icons.js then ' +
      'scripts/upload-emojis.js to enable icons. The bot will run without them until then.'
  );
}

// Inline tag for use inside card text, e.g. "<:ticket:123456789012345678>"
function icon(name) {
  return ICONS[name]?.tag || '';
}

// {id, name} shape for ButtonBuilder.setEmoji() / StringSelectMenuOptionBuilder.setEmoji()
function iconEmoji(name) {
  const entry = ICONS[name];
  return entry ? { id: entry.id, name: entry.name } : null;
}

module.exports = { COLORS, ICONS, icon, iconEmoji };
