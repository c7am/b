const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../db/database');
const erlcDb = require('../erlc/database');
const { icon } = require('../config');

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
    const subcommand = interaction.options.getSubcommand();
    const guildConfig = await db.getGuildConfig(interaction.guildId);
    const serverKey = guildConfig?.erlc_api_key;

    if (!serverKey) {
      return interaction.reply({
        content: `${icon('error')} ERLC API key not configured.`,
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
        console.error('[shift-start] error:', err);
        interaction.reply({
          content: `${icon('error')} Failed to start shift: ${err.message}`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } else if (subcommand === 'end') {
      try {
        const activeShifts = await erlcDb.getActiveShifts(interaction.guildId);
        const userShift = activeShifts.find(s => s.officer_id === interaction.user.id);

        if (!userShift) {
          return interaction.reply({
            content: `${icon('error')} No active shift found.`,
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
        console.error('[shift-end] error:', err);
        interaction.reply({
          content: `${icon('error')} Failed to end shift: ${err.message}`,
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
        console.error('[shift-active] error:', err);
        interaction.reply({
          content: `${icon('error')} Failed to fetch shifts: ${err.message}`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
