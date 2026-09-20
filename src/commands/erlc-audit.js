const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const db = require('../db/database');
const erlcDb = require('../erlc/database');
const { icon } = require('../config');
const { createError, logErrorToDiscord, ErrorCodes } = require('../utils/errorCodes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('audit-log')
    .setDescription('View ERLC audit log entries')
    .addStringOption(opt =>
      opt
        .setName('action')
        .setDescription('Filter by action type (warn_issued, shift_start, shift_end, etc.)')
        .setRequired(false)
        .addChoices(
          { name: 'warn_issued', value: 'warn_issued' },
          { name: 'shift_start', value: 'shift_start' },
          { name: 'shift_end', value: 'shift_end' },
          { name: 'kick_issued', value: 'kick_issued' },
          { name: 'infraction_recorded', value: 'infraction_recorded' }
        )
    )
    .addIntegerOption(opt =>
      opt.setName('limit').setDescription('Number of entries to show (1-50, default 25)').setRequired(false).setMinValue(1).setMaxValue(50)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    try {
      const guildConfig = await db.getGuildConfig(interaction.guildId);
      const serverKey = guildConfig?.erlc_api_key;

      if (!serverKey) {
        const error = createError(ErrorCodes.ERLC_CLIENT_INIT_FAILED, 'ERLC API key not set');
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'audit-log', guild_id: interaction.guildId }, interaction.client);
        return interaction.reply({
          content: `${icon('error')} ${error.message} Set it in Dashboard > Settings > ERLC Configuration`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const actionFilter = interaction.options.getString('action');
      const limit = interaction.options.getInteger('limit') || 25;

      await interaction.deferReply();

      const logs = await erlcDb.getAuditLog(interaction.guildId, actionFilter, limit);

      if (!logs.length) {
        const embed = new EmbedBuilder()
          .setTitle('Audit Log')
          .setDescription('No log entries found.')
          .setColor('999999');
        return interaction.editReply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setTitle('Audit Log' + (actionFilter ? ` - ${actionFilter}` : ''))
        .setColor('1E90FF')
        .setDescription(
          logs.map((log, i) => {
            const date = new Date(log.created_at).toLocaleDateString();
            const time = new Date(log.created_at).toLocaleTimeString();
            const details = log.details ? ` | ${JSON.stringify(log.details)}` : '';
            return `${i + 1}. **${log.action}** (${date} ${time})\n` +
                   `   By: ${log.actor_name} | Target: ${log.target_name || 'N/A'}${details}`;
          }).join('\n\n')
        )
        .setFooter({ text: `Showing ${logs.length} of recent entries` });

      interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const error = createError(ErrorCodes.AUDIT_LOG_READ_FAILED, `Filter: ${interaction.options.getString('action') || 'none'}, Limit: ${interaction.options.getInteger('limit') || 25}`, err);
      await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'audit-log', guild_id: interaction.guildId }, interaction.client);
      
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
