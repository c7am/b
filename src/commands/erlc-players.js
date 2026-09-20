const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS, icon } = require('../config');
const { buildCard, V2 } = require('../utils/components');
const { canManageStaff } = require('../utils/permissions');
const { getCurrentPlayers } = require('../handlers/erlcHandler');
const { createError, logErrorToDiscord, ErrorCodes } = require('../utils/errorCodes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('erlc-players')
    .setDescription('View current players on the ERLC server'),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      if (!canManageStaff(interaction.member, interaction.guild)) {
        const error = createError(ErrorCodes.AUTH_PERMISSION_DENIED, `User: ${interaction.user.id}`);
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'erlc-players', guild_id: interaction.guildId }, interaction.client);
        return interaction.editReply({
          content: `${icon('error')} ${error.message}`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const result = await getCurrentPlayers(interaction.guildId);
      if (result.error) {
        const error = createError(ErrorCodes.ERLC_CONNECTION_TIMEOUT, result.error);
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'erlc-players', guild_id: interaction.guildId }, interaction.client);
        return interaction.editReply({
          content: `${icon('error')} ${error.message} Check that ERLC API key is configured in settings.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const players = result.players || [];
      if (players.length === 0) {
        return interaction.editReply({
          content: 'No players currently on the ERLC server.',
          flags: MessageFlags.Ephemeral,
        });
      }

      // Build player list
      const playerLines = players
        .slice(0, 20) // Limit to 20 for embed size
        .map((p) => `**${p.username || p.name}** - Team: ${p.team || 'Civilian'}`)
        .join('\n');

      const card = buildCard({
        accentColor: COLORS.mauve,
        heading: `${icon('users')} ERLC Players (${players.length})`,
        lines: [playerLines || 'No players'],
      });

      return interaction.editReply({ ...V2, components: [card] });
    } catch (err) {
      const error = createError(ErrorCodes.CMD_EXECUTION_FAILED, 'erlc-players', err);
      await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'erlc-players', guild_id: interaction.guildId }, interaction.client);
      
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
