const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');

/**
 * Build a single Components V2 "card": an accent-colored container with a
 * heading, body text, an optional thumbnail (avatar, banner, whatever image
 * fits), optional buttons, and an optional muted footer line.
 *
 * @param {object} opts
 * @param {number} opts.accentColor - one of config.COLORS
 * @param {string} opts.heading - heading text, icon already included if wanted
 * @param {string[]} [opts.lines] - body lines, joined with newlines
 * @param {string} [opts.thumbnailUrl] - image shown on the right of the heading
 * @param {import('discord.js').ButtonBuilder[]} [opts.buttons] - buttons rendered inside the card
 * @param {string} [opts.footer] - small muted line at the bottom
 * @returns {ContainerBuilder}
 */
function buildCard({ accentColor, heading, lines = [], thumbnailUrl, buttons, footer }) {
  const container = new ContainerBuilder().setAccentColor(accentColor);
  const headingDisplay = new TextDisplayBuilder().setContent(`### ${heading}`);

  if (thumbnailUrl) {
    const section = new SectionBuilder()
      .addTextDisplayComponents(headingDisplay)
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(thumbnailUrl));
    container.addSectionComponents(section);
  } else {
    container.addTextDisplayComponents(headingDisplay);
  }

  if (lines.length) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n')));
  }

  if (buttons?.length) {
    container.addActionRowComponents(new ActionRowBuilder().addComponents(...buttons));
  }

  if (footer) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${footer}`));
  }

  return container;
}

// Every Components V2 message needs this flag. Spread this into reply/send
// options alongside `components`.
const V2 = { flags: MessageFlags.IsComponentsV2 };

module.exports = { buildCard, V2 };
