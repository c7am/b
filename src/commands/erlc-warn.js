const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const db = require('../db/database');
const erlcDb = require('../erlc/database');
const { ERLCClient } = require('../erlc/client');
const { icon } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn an in-game player (ERLC integration)')
    .addStringOption(opt => opt.setName('player').setDescription('Player name or ID').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for warning').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const playerName = interaction.options.getString('player');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const guildConfig = await db.getGuildConfig(interaction.guildId);
    const serverKey = guildConfig?.erlc_api_key;

    if (!serverKey) {
      return interaction.reply({
        content: `${icon('error')} ERLC API key not configured. Set it in Dashboard > Settings > ERLC Configuration`,
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

      const warnCount = await erlcDb.getInfractionCount(interaction.guildId, serverKey, player.id, 'warn');
      await erlcDb.addInfraction(
        interaction.guildId, serverKey, player.id, player.name,
        'warn', reason, interaction.user.id, interaction.user.username
      );
      await erlcDb.logAuditEntry(
        interaction.guildId, 'warn_issued',
        interaction.user.id, interaction.user.username,
        player.id, player.name,
        { reason, warnCount: warnCount + 1 }
      );

      // Auto-kick after 3 warns
      if (warnCount + 1 >= 3) {
        await client.runCommand(`:kick ${player.name} Auto-kicked after 3 warnings`);
        await erlcDb.addInfraction(
          interaction.guildId, serverKey, player.id, player.name,
          'kick', 'Auto-kick (3 warns)', 'System', 'Axiom'
        );
        return interaction.editReply(
          `${icon('warning')} **${player.name}** warned (${warnCount + 1}/3) → **Auto-kicked**\nReason: ${reason}`
        );
      }

      interaction.editReply(
        `${icon('warning')} **${player.name}** warned (${warnCount + 1}/3)\nReason: ${reason}`
      );
    } catch (err) {
      console.error('[warn] error:', err);
      interaction.editReply({
        content: `${icon('error')} Failed to warn player: ${err.message}`,
      });
    }
  },
};
