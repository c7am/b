const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');
const { COLORS, icon, iconEmoji } = require('../config');
const { buildCard, V2 } = require('../utils/components');
const { isTicketStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Post the support ticket panel in this channel'),

  async execute(interaction) {
    if (!(await isTicketStaff(interaction.member, interaction.guildId))) {
      console.error(`[ticket-panel] ${interaction.user.tag} attempted to post the panel without permission`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Permission Denied`,
        lines: ["You don't have permission to post the ticket panel. This requires the **Ticket Staff** role or the **Manage Channels** permission."],
      });
      return interaction.reply({ components: [card], ...V2, flags: MessageFlags.Ephemeral });
    }

    const lines = [
      "Need help with something? Pick the category below that best matches your issue, and you'll be asked to describe it in a bit more detail before your ticket is created. A member of staff will be with you as soon as they're able.",
      '',
      '**General**: Giveaway claims, minor issues, and general questions.',
      '**Management**: Ban appeals, reports, and serious issues.',
      '**Partnership**: Partnership requests and related inquiries.',
      '**Ownership**: High-ranking reports and escalations.',
      '',
      '-# Please only open one ticket at a time for a given issue, duplicates just split up the conversation and slow things down for everyone.',
    ];

    const card = buildCard({
      accentColor: COLORS.mauve,
      heading: `${icon('ticket')} ISRP Support`,
      lines,
    });

    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket_category_select')
      .setPlaceholder('Select a category to begin');

    const options = [
      { label: 'General', value: 'general', description: 'Giveaway claims, minor issues, and questions' },
      { label: 'Management', value: 'management', description: 'Ban appeals, reports, and serious issues' },
      { label: 'Partnership', value: 'partnership', description: 'Partnership requests and inquiries' },
      { label: 'Ownership', value: 'ownership', description: 'High-ranking reports and escalations' },
    ];

    for (const opt of options) {
      const builder = new StringSelectMenuOptionBuilder()
        .setLabel(opt.label)
        .setValue(opt.value)
        .setDescription(opt.description);
      const emoji = iconEmoji(opt.value);
      if (emoji) builder.setEmoji(emoji);
      select.addOptions(builder);
    }

    const selectRow = new ActionRowBuilder().addComponents(select);

    try {
      await interaction.channel.send({
        components: [card, selectRow],
        ...V2,
      });

      console.log(`[ticket-panel] ${interaction.user.tag} posted the panel in #${interaction.channel.name}`);

      await interaction.reply({
        content: `${icon('success')} The support panel is live in this channel and ready for members to use.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.error(`[ticket-panel] Failed to post panel: ${err.message}`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Couldn't Post the Panel`,
        lines: [
          `Discord returned an error trying to post here: ${err.message}`,
          "\nMake sure the bot has permission to **send messages** in this channel, then try again.",
        ],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }
  },
};
