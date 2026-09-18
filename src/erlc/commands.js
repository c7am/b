/**
 * ERLC Discord Slash Commands
 * - /warn <player> [reason]
 * - /infraction-history <player>
 * - /shift start
 * - /shift end
 * - /shift active
 * - /audit-log [action]
 * - /team-sync <team> <role>
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db/database');
const erlcDb = require('./database');
const { ERLCClient } = require('./client');

module.exports = {
  // /warn command
  warn: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a player in ERLC (1st step before kick)')
    .addStringOption(opt => opt.setName('player').setDescription('Player name or ID').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for warning').setRequired(false))
    .addStringOption(opt => opt.setName('server_key').setDescription('ERLC server key (if not set globally)').setRequired(false)),

  async warnHandler(interaction) {
    const playerName = interaction.options.getString('player');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const serverKey = interaction.options.getString('server_key');

    const guildConfig = await db.getGuildConfig(interaction.guildId);
    const key = serverKey || guildConfig?.erlc_api_key;
    if (!key) return interaction.reply('ERLC API key not configured. Use `/erlc setapi <key>`');

    const client = new ERLCClient(key);
    const players = await client.getPlayers();
    const player = players.find(p => p.name.toLowerCase() === playerName.toLowerCase() || p.id === playerName);
    if (!player) return interaction.reply(`Player "${playerName}" not found.`);

    const warnCount = await erlcDb.getInfractionCount(interaction.guildId, key, player.id, 'warn');
    await erlcDb.addInfraction(interaction.guildId, key, player.id, player.name, 'warn', reason, interaction.user.id, interaction.user.username);
    await erlcDb.logAuditEntry(interaction.guildId, 'warn_issued', interaction.user.id, interaction.user.username, player.id, player.name, { reason, warnCount: warnCount + 1 });

    // Auto-kick after 3 warns
    if (warnCount + 1 >= 3) {
      await client.runCommand(`:kick ${player.name} Auto-kicked after 3 warnings`);
      await erlcDb.addInfraction(interaction.guildId, key, player.id, player.name, 'kick', 'Auto-kick (3 warns)', 'System', 'Axiom');
      return interaction.reply(`⚠️ **${player.name}** warned (${warnCount + 1}/3) → **Auto-kicked**\nReason: ${reason}`);
    }

    interaction.reply(`⚠️ **${player.name}** warned (${warnCount + 1}/3)\nReason: ${reason}`);
  },

  // /infraction-history command
  infractionHistory: new SlashCommandBuilder()
    .setName('infraction-history')
    .setDescription('Check player infraction history')
    .addStringOption(opt => opt.setName('player').setDescription('Player name or ID').setRequired(true))
    .addStringOption(opt => opt.setName('server_key').setDescription('ERLC server key').setRequired(false)),

  async infractionHistoryHandler(interaction) {
    const playerName = interaction.options.getString('player');
    const serverKey = interaction.options.getString('server_key');

    const guildConfig = await db.getGuildConfig(interaction.guildId);
    const key = serverKey || guildConfig?.erlc_api_key;
    if (!key) return interaction.reply('ERLC API key not configured.');

    const client = new ERLCClient(key);
    const players = await client.getPlayers();
    const player = players.find(p => p.name.toLowerCase() === playerName.toLowerCase() || p.id === playerName);
    if (!player) return interaction.reply(`Player "${playerName}" not found.`);

    const infractions = await erlcDb.getInfractions(interaction.guildId, key, player.id);
    if (!infractions.length) return interaction.reply(`No infractions for **${player.name}**.`);

    const embed = new EmbedBuilder()
      .setTitle(`Infractions: ${player.name}`)
      .setColor('FF6B6B')
      .setDescription(infractions.map((inf, i) => 
        `${i + 1}. **${inf.infraction_type.toUpperCase()}** (${new Date(inf.created_at).toLocaleDateString()})\n` +
        `   Reason: ${inf.reason}\n` +
        `   By: ${inf.staff_name}`
      ).join('\n'));

    interaction.reply({ embeds: [embed] });
  },

  // /shift start command
  shiftStart: new SlashCommandBuilder()
    .setName('shift')
    .setDescription('Manage shifts')
    .addSubcommand(sub => sub
      .setName('start')
      .setDescription('Start a shift')
      .addStringOption(opt => opt.setName('callsign').setDescription('Your callsign').setRequired(false))
      .addStringOption(opt => opt.setName('department').setDescription('Department (LE/FD/EMS/TOW)').setRequired(false))
    )
    .addSubcommand(sub => sub
      .setName('end')
      .setDescription('End your shift')
    )
    .addSubcommand(sub => sub
      .setName('active')
      .setDescription('View active shifts')
    ),

  async shiftHandler(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'start') {
      const callsign = interaction.options.getString('callsign') || 'N/A';
      const department = interaction.options.getString('department') || 'Unassigned';

      const guildConfig = await db.getGuildConfig(interaction.guildId);
      if (!guildConfig?.erlc_api_key) return interaction.reply('ERLC API key not configured.');

      const shiftId = await erlcDb.startShift(
        interaction.guildId,
        guildConfig.erlc_api_key,
        interaction.user.id,
        interaction.user.username,
        callsign,
        department
      );
      await erlcDb.logAuditEntry(interaction.guildId, 'shift_start', interaction.user.id, interaction.user.username, interaction.user.id, interaction.user.username, { callsign, department });

      interaction.reply(`✅ Shift started\n**Callsign:** ${callsign}\n**Department:** ${department}`);
    } else if (subcommand === 'end') {
      const activeShifts = await erlcDb.getActiveShifts(interaction.guildId);
      const userShift = activeShifts.find(s => s.officer_id === interaction.user.id);
      if (!userShift) return interaction.reply('No active shift found.');

      const minutes = await erlcDb.endShift(userShift.id);
      await erlcDb.logAuditEntry(interaction.guildId, 'shift_end', interaction.user.id, interaction.user.username, interaction.user.id, interaction.user.username, { duration: minutes });

      interaction.reply(`✅ Shift ended\n**Duration:** ${Math.floor(minutes / 60)}h ${minutes % 60}m`);
    } else if (subcommand === 'active') {
      const shifts = await erlcDb.getActiveShifts(interaction.guildId);
      if (!shifts.length) return interaction.reply('No active shifts.');

      const embed = new EmbedBuilder()
        .setTitle('Active Shifts')
        .setColor('1E90FF')
        .setDescription(shifts.map(s => 
          `**${s.officer_name}** - ${s.shift_callsign} (${s.shift_department})\n` +
          `Started: <t:${Math.floor(s.start_time / 1000)}:R>`
        ).join('\n\n'));

      interaction.reply({ embeds: [embed] });
    }
  },

  // /audit-log command
  auditLog: new SlashCommandBuilder()
    .setName('audit-log')
    .setDescription('View staff action audit log')
    .addStringOption(opt => opt.setName('action').setDescription('Filter by action type').setRequired(false)),

  async auditLogHandler(interaction) {
    const action = interaction.options.getString('action');
    const logs = await erlcDb.getAuditLog(interaction.guildId, 50, action);

    if (!logs.length) return interaction.reply('No audit logs found.');

    const embed = new EmbedBuilder()
      .setTitle('Audit Log')
      .setColor('FFA500')
      .setDescription(logs.slice(0, 10).map(log => 
        `**${log.action}** - ${new Date(log.created_at).toLocaleDateString()} ${new Date(log.created_at).toLocaleTimeString()}\n` +
        `By: ${log.actor_name} | Target: ${log.target_name || 'N/A'}`
      ).join('\n\n'))
      .setFooter({ text: `Showing 10 of ${logs.length}` });

    interaction.reply({ embeds: [embed] });
  },
};
