const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const db = require('../db/database');
const erlcDb = require('../erlc/database');
const { icon } = require('../config');

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
    const guildConfig = await db.getGuildConfig(interaction.guildId);
    const serverKey = guildConfig?.erlc_api_key;

    if (!serverKey) {
      return interaction.reply({
        content: `${icon('error')} ERLC API key not configured.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const actionFilter = interaction.options.getString('action');
    const limit = interaction.options.getInteger('limit') || 25;

    await interaction.deferReply();

    try {
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
      console.error('[audit-log] error:', err);
      interaction.editReply({
        content: `${icon('error')} Failed to fetch audit log: ${err.message}`,
      });
    }
  },
};
