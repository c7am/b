const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const db = require('../db/database');
const erlcDb = require('../erlc/database');
const { ERLCClient } = require('../erlc/client');
const { icon } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infraction-history')
    .setDescription('Check player infraction history (ERLC)')
    .addStringOption(opt => opt.setName('player').setDescription('Player name or ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const playerName = interaction.options.getString('player');

    const guildConfig = await db.getGuildConfig(interaction.guildId);
    const serverKey = guildConfig?.erlc_api_key;

    if (!serverKey) {
      return interaction.reply({
        content: `${icon('error')} ERLC API key not configured.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    try {
      const client = new ERLCClient(serverKey);
      const players = await client.getPlayers();
      const player = players.find(p => p.name.toLowerCase() === playerName.toLowerCase() || p.id.toString() === playerName);

      if (!player) {
        return interaction.editReply({
          content: `${icon('error')} Player "${playerName}" not found.`,
        });
      }

      const infractions = await erlcDb.getInfractions(interaction.guildId, serverKey, player.id);

      if (!infractions.length) {
        const embed = new EmbedBuilder()
          .setTitle(`Infractions: ${player.name}`)
          .setDescription('No infractions on record.')
          .setColor('00AA00');
        return interaction.editReply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setTitle(`Infractions: ${player.name}`)
        .setColor('FF6B6B')
        .setDescription(
          infractions.map((inf, i) => {
            const date = new Date(inf.created_at).toLocaleDateString();
            return `${i + 1}. **${inf.infraction_type.toUpperCase()}** (${date})\n` +
                   `   Reason: ${inf.reason}\n` +
                   `   By: ${inf.staff_name}`;
          }).join('\n\n')
        );

      interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('[infraction-history] error:', err);
      interaction.editReply({
        content: `${icon('error')} Failed to fetch infractions: ${err.message}`,
      });
    }
  },
};
