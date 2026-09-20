const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../db/database');
const erlcDb = require('../erlc/database');
const { icon } = require('../config');
const { createError, logErrorToDiscord, ErrorCodes } = require('../utils/errorCodes');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shift')
    .setDescription('Manage ERLC shifts (shift start/end/active)')
    .addSubcommand(sub =>
      sub
        .setName('start')
        .setDescription('Start a shift')
        .addStringOption(opt => opt.setName('callsign').setDescription('Your callsign (optional)').setRequired(false))
        .addStringOption(opt => opt.setName('department').setDescription('Department: LE/FD/EMS/TOW (optional)').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('end').setDescription('End your active shift')
    )
    .addSubcommand(sub =>
      sub.setName('active').setDescription('View all active shifts')
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guildConfig = await db.getGuildConfig(interaction.guildId);
      const serverKey = guildConfig?.erlc_api_key;

      if (!serverKey) {
        const error = createError(ErrorCodes.ERLC_CLIENT_INIT_FAILED, 'ERLC API key not set');
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'shift', guild_id: interaction.guildId }, interaction.client);
        return interaction.reply({
          content: `${icon('error')} ${error.message} Set it in Dashboard > Settings > ERLC Configuration`,
          flags: MessageFlags.Ephemeral,
        });
      }

      if (subcommand === 'start') {
        const callsign = interaction.options.getString('callsign') || 'N/A';
        const department = interaction.options.getString('department') || 'Unassigned';

        try {
          const shiftId = await erlcDb.startShift(
            interaction.guildId,
            serverKey,
            interaction.user.id,
            interaction.user.username,
            callsign,
            department
          );
          await erlcDb.logAuditEntry(
            interaction.guildId, 'shift_start',
            interaction.user.id, interaction.user.username,
            interaction.user.id, interaction.user.username,
            { callsign, department }
          );

          interaction.reply({
            content: `${icon('success')} Shift started\n**Callsign:** ${callsign}\n**Department:** ${department}`,
            flags: MessageFlags.Ephemeral,
          });
        } catch (err) {
          const error = createError(ErrorCodes.SHIFT_RECORD_FAILED, `Callsign: ${callsign}, Dept: ${department}`, err);
          await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'shift start', guild_id: interaction.guildId }, interaction.client);
          interaction.reply({
            content: `${icon('error')} ${error.message}`,
            flags: MessageFlags.Ephemeral,
          });
        }
      } else if (subcommand === 'end') {
        try {
          const activeShifts = await erlcDb.getActiveShifts(interaction.guildId);
          const userShift = activeShifts.find(s => s.officer_id === interaction.user.id);

          if (!userShift) {
            const error = createError(ErrorCodes.SHIFT_NOT_STARTED, `User: ${interaction.user.id}`);
            await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'shift end', guild_id: interaction.guildId }, interaction.client);
            return interaction.reply({
              content: `${icon('error')} ${error.message}`,
              flags: MessageFlags.Ephemeral,
            });
          }

          const minutes = await erlcDb.endShift(userShift.id);
          await erlcDb.logAuditEntry(
            interaction.guildId, 'shift_end',
            interaction.user.id, interaction.user.username,
            interaction.user.id, interaction.user.username,
            { duration: minutes }
          );

          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          interaction.reply({
            content: `${icon('success')} Shift ended\n**Duration:** ${hours}h ${mins}m`,
            flags: MessageFlags.Ephemeral,
          });
        } catch (err) {
          const error = createError(ErrorCodes.SHIFT_RECORD_FAILED, `User: ${interaction.user.id}`, err);
          await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'shift end', guild_id: interaction.guildId }, interaction.client);
          interaction.reply({
            content: `${icon('error')} ${error.message}`,
            flags: MessageFlags.Ephemeral,
          });
        }
      } else if (subcommand === 'active') {
        try {
          const shifts = await erlcDb.getActiveShifts(interaction.guildId);

          if (!shifts.length) {
            return interaction.reply({
              content: `${icon('info')} No active shifts.`,
              flags: MessageFlags.Ephemeral,
            });
          }

          const embed = new EmbedBuilder()
            .setTitle('Active Shifts')
            .setColor('1E90FF')
            .setDescription(
              shifts.map(s => {
                const startTs = Math.floor(new Date(s.start_time).getTime() / 1000);
                return `**${s.officer_name}** - ${s.shift_callsign} (${s.shift_department})\nStarted: <t:${startTs}:R>`;
              }).join('\n\n')
            );

          interaction.reply({ embeds: [embed] });
        } catch (err) {
          const error = createError(ErrorCodes.CMD_EXECUTION_FAILED, `Subcommand: shift active`, err);
          await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'shift active', guild_id: interaction.guildId }, interaction.client);
          interaction.reply({
            content: `${icon('error')} ${error.message}`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } catch (err) {
      const error = createError(ErrorCodes.CMD_EXECUTION_FAILED, `Subcommand: ${interaction.options.getSubcommand()}`, err);
      await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'shift', guild_id: interaction.guildId }, interaction.client);
      interaction.reply({
        content: `${icon('error')} ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
