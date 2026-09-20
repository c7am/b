const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const db = require('../db/database');
const erlcDb = require('../erlc/database');
const { ERLCClient } = require('../erlc/client');
const { icon } = require('../config');
const { createError, logErrorToDiscord, ErrorCodes } = require('../utils/errorCodes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infraction-history')
    .setDescription('Check player infraction history (ERLC)')
    .addStringOption(opt => opt.setName('player').setDescription('Player name or ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    try {
      const playerName = interaction.options.getString('player');

      if (!playerName || playerName.trim().length === 0) {
        const error = createError(ErrorCodes.CMD_INVALID_ARGS, 'Player name is required');
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'infraction-history', guild_id: interaction.guildId }, interaction.client);
        return interaction.reply({
          content: `${icon('error')} ${error.message}`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const guildConfig = await db.getGuildConfig(interaction.guildId);
      const serverKey = guildConfig?.erlc_api_key;

      if (!serverKey) {
        const error = createError(ErrorCodes.ERLC_CLIENT_INIT_FAILED, 'ERLC API key not set');
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'infraction-history', guild_id: interaction.guildId }, interaction.client);
        return interaction.reply({
          content: `${icon('error')} ${error.message} Set it in Dashboard > Settings > ERLC Configuration`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await interaction.deferReply();

      const client = new ERLCClient(serverKey);
      const players = await client.getPlayers();
      const player = players.find(p => p.name.toLowerCase() === playerName.toLowerCase() || p.id.toString() === playerName);

      if (!player) {
        const error = createError(ErrorCodes.ERLC_PLAYER_NOT_FOUND, `Player: ${playerName}`);
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'infraction-history', guild_id: interaction.guildId }, interaction.client);
        return interaction.editReply({
          content: `${icon('error')} ${error.message}`,
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
      const error = createError(ErrorCodes.INFRACT_HISTORY_EMPTY, `Player: ${interaction.options.getString('player')}`, err);
      await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'infraction-history', guild_id: interaction.guildId }, interaction.client);
      
      const isDeferred = interaction.deferred;
      const reply = { content: `${icon('error')} ${error.message}`, flags: MessageFlags.Ephemeral };
      
      if (isDeferred) {
        await interaction.editReply(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};
