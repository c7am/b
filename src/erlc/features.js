/**
 * ERLC Advanced Features
 * - Server shutdown with alerts & mass kick
 * - Team/role sync enforcement
 * - Ban appeals system
 * - Server info live panel
 * - Analytics (kills, shifts, infractions)
 * - Character auto-generator
 * - 911/Dispatch call system
 */

const { EmbedBuilder } = require('discord.js');
const erlcDb = require('./database');

/**
 * Server Shutdown: Alert players & mass kick
 */
async function shutdownServer(erlcClient, guildId, discordClient, reason = 'Server maintenance') {
  try {
    // Announce shutdown in game
    await erlcClient.runCommand(`:h ${reason} - Server shutting down in 30s`);
    
    // Wait a bit, then mass kick
    setTimeout(async () => {
      const players = await erlcClient.getPlayers();
      for (const player of players) {
        await erlcClient.runCommand(`:kick ${player.name} Server shutdown`);
      }
    }, 30000);

    // Log to Discord
    const guild = discordClient.guilds.cache.get(guildId);
    if (guild) {
      const logChannels = guild.channels.cache.filter(ch => ch.name.includes('log'));
      for (const ch of logChannels.values()) {
        await ch.send(`🔴 **SERVER SHUTDOWN INITIATED**\nReason: ${reason}\nAll players will be kicked in 30 seconds.`);
      }
    }

    await erlcDb.logAuditEntry(guildId, 'server_shutdown', 'System', 'Axiom', null, null, { reason });
    return true;
  } catch (error) {
    console.error('[erlc] Shutdown error:', error);
    return false;
  }
}

/**
 * Team/Role Sync: Enforce role-based team access
 * Lock police team to @LEO role, fire team to @Firefighter, etc.
 */
async function syncTeamRoles(erlcClient, discordGuild, db, guildId, serverKey) {
  try {
    const players = await erlcClient.getPlayers();
    const config = await db.get('SELECT * FROM team_role_sync WHERE guild_id = ?', guildId);
    if (!config || !config.enabled) return;

    const teamLocks = {
      police: config.police_role_id,
      fire: config.fire_role_id,
      ems: config.ems_role_id,
      tow: config.tow_role_id,
    };

    for (const [team, roleId] of Object.entries(teamLocks)) {
      if (!roleId) continue;

      const role = discordGuild.roles.cache.get(roleId);
      if (!role) continue;

      for (const player of players) {
        if (player.team.toLowerCase() !== team.toLowerCase()) continue;

        // Find Discord member by Roblox ID via linking table
        const link = await erlcDb.findMemberByRobloxId(db, guildId, player.id);
        if (!link) continue;

        const member = await discordGuild.members.fetch(link.discord_id).catch(() => null);
        if (!member) continue;

        if (!member.roles.cache.has(roleId)) {
          // Auto-move back to civilian
          await erlcClient.runCommand(`:move ${player.name} civilian`);
          await member.send(`❌ You were moved from ${team} (missing @${role.name} role)`).catch(() => {});
          await erlcDb.logAuditEntry(db, guildId, 'team_sync_enforce', 'System', 'Axiom', member.id, member.user.username, { team, reason: 'Missing role' });
        }
      }
    }
  } catch (error) {
    console.error('[erlc] Team sync error:', error);
  }
}

/**
 * Ban Appeals: Modal form + review workflow
 */
async function createBanAppealModal() {
  // Return Discord Modal for ban appeal
  return {
    title: 'Ban Appeal',
    customId: 'ban_appeal_modal',
    components: [
      {
        type: 1, // action row
        components: [
          {
            type: 4, // text input
            customId: 'appeal_reason',
            label: 'Why should your ban be appealed?',
            style: 2, // paragraph
            required: true,
            max_length: 1000,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            customId: 'appeal_context',
            label: 'Any context for the staff?',
            style: 2,
            required: false,
            max_length: 500,
          },
        ],
      },
    ],
  };
}

/**
 * Live Server Info Panel
 */
async function createServerInfoEmbed(erlcClient, guildConfig) {
  const server = await erlcClient.getServer();
  const [players, queue, staff, vehicles] = await Promise.all([
    erlcClient.getPlayers(),
    erlcClient.getQueue(),
    erlcClient.getStaff(),
    erlcClient.getVehicles(),
  ]);

  const embed = new EmbedBuilder()
    .setTitle(`📊 ${server.name || 'ERLC Server'}`)
    .setColor('1E90FF')
    .addFields(
      { name: '🔗 Join Key', value: `\`${server.join_key || 'N/A'}\`` },
      { name: '👥 Players Online', value: `${(players || []).length} online`, inline: true },
      { name: '⏳ Queue Length', value: `${(queue || []).length} waiting`, inline: true },
      { name: '👮 Staff Online', value: `${(staff || []).length} staff`, inline: true },
      { name: '🚗 Vehicles Spawned', value: `${(vehicles || []).length} vehicles`, inline: true },
    )
    .setFooter({ text: `Last updated: ${new Date().toLocaleTimeString()}` });

  return embed;
}

/**
 * Character Auto-Generator
 * Civilians create character via modal, bot auto-gens in-game
 */
async function createCharacterGeneratorModal() {
  return {
    title: 'Create Character',
    customId: 'char_gen_modal',
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            customId: 'char_firstname',
            label: 'First Name',
            style: 1, // short
            required: true,
            max_length: 30,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            customId: 'char_lastname',
            label: 'Last Name',
            style: 1,
            required: true,
            max_length: 30,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            customId: 'char_age',
            label: 'Age',
            style: 1,
            required: true,
            max_length: 3,
          },
        ],
      },
    ],
  };
}

/**
 * Analytics: Shift Duration Stats
 */
async function getShiftAnalytics(db, guildId, days = 30) {
  const cutoff = Date.now() - (days * 86400000);
  const shifts = await db.all(
    'SELECT * FROM shift_logs WHERE guild_id = ? AND created_at > ? AND duration_minutes IS NOT NULL ORDER BY created_at DESC',
    guildId, cutoff
  );

  if (!shifts.length) return null;

  const totalMinutes = shifts.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const avgMinutes = Math.round(totalMinutes / shifts.length);
  const maxShift = Math.max(...shifts.map(s => s.duration_minutes || 0));
  const officers = new Set(shifts.map(s => s.officer_id));

  return {
    totalShifts: shifts.length,
    totalHours: Math.round(totalMinutes / 60),
    avgDuration: `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`,
    maxDuration: `${Math.floor(maxShift / 60)}h ${maxShift % 60}m`,
    uniqueOfficers: officers.size,
    shifts,
  };
}

/**
 * Analytics: Infraction Trends
 */
async function getInfractionAnalytics(db, guildId, serverKey, days = 30) {
  const cutoff = Date.now() - (days * 86400000);
  const infractions = await db.all(
    'SELECT * FROM infractions WHERE guild_id = ? AND server_key = ? AND created_at > ? ORDER BY created_at DESC',
    guildId, serverKey, cutoff
  );

  if (!infractions.length) return null;

  const byType = {};
  const byStaff = {};
  const byPlayer = {};

  for (const inf of infractions) {
    byType[inf.infraction_type] = (byType[inf.infraction_type] || 0) + 1;
    byStaff[inf.staff_name] = (byStaff[inf.staff_name] || 0) + 1;
    byPlayer[inf.roblox_name] = (byPlayer[inf.roblox_name] || 0) + 1;
  }

  return {
    totalInfractions: infractions.length,
    byType,
    topStaff: Object.entries(byStaff).sort((a, b) => b[1] - a[1]).slice(0, 5),
    repeatOffenders: Object.entries(byPlayer).sort((a, b) => b[1] - a[1]).slice(0, 5),
    infractions,
  };
}

/**
 * Analytics: Kill Logs
 */
async function getKillAnalytics(db, guildId, days = 30) {
  const cutoff = Date.now() - (days * 86400000);
  const kills = await db.all(
    'SELECT * FROM audit_log WHERE guild_id = ? AND action = ? AND created_at > ? ORDER BY created_at DESC',
    guildId, 'player_killed', cutoff
  );

  if (!kills.length) return null;

  const topKillers = {};
  const byWeapon = {};

  for (const kill of kills) {
    const details = JSON.parse(kill.details || '{}');
    topKillers[kill.actor_name] = (topKillers[kill.actor_name] || 0) + 1;
    byWeapon[details.weapon] = (byWeapon[details.weapon] || 0) + 1;
  }

  return {
    totalKills: kills.length,
    topKillers: Object.entries(topKillers).sort((a, b) => b[1] - a[1]).slice(0, 5),
    byWeapon,
    kills,
  };
}

/**
 * 911/Dispatch Call System
 * Civilians can request emergency services
 */
async function create911CallModal() {
  return {
    title: 'Request Emergency Services',
    customId: 'call_911_modal',
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            customId: 'call_type',
            label: 'Type of Emergency (Medical/Fire/Police/Tow)',
            style: 1,
            required: true,
            max_length: 20,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            customId: 'call_location',
            label: 'Location (area or coordinates)',
            style: 1,
            required: true,
            max_length: 50,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            customId: 'call_description',
            label: 'What is the emergency?',
            style: 2,
            required: true,
            max_length: 500,
          },
        ],
      },
    ],
  };
}

/**
 * Handle 911 call submission
 */
async function handle911Call(interaction, db, guildId, erlcClient) {
  const callType = interaction.fields.getTextInputValue('call_type');
  const location = interaction.fields.getTextInputValue('call_location');
  const description = interaction.fields.getTextInputValue('call_description');

  const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Announce in-game via server
  await erlcClient.runCommand(`:h 911 CALL - ${callType.toUpperCase()} - ${location}`);
  
  // Log to dispatch channel
  const guild = interaction.guild;
  const dispatchChannels = guild.channels.cache.filter(ch => ch.name.includes('dispatch'));
  
  const dispatchEmbed = new EmbedBuilder()
    .setTitle(`📞 911 Call ID: ${callId}`)
    .setColor('FF4444')
    .addFields(
      { name: 'Type', value: callType, inline: true },
      { name: 'Caller', value: interaction.user.username, inline: true },
      { name: 'Location', value: location },
      { name: 'Description', value: description },
    )
    .setTimestamp();

  for (const ch of dispatchChannels.values()) {
    await ch.send({ embeds: [dispatchEmbed] });
  }

  await erlcDb.logAuditEntry(guildId, 'call_911', interaction.user.id, interaction.user.username, null, null, { callType, location, description });
  
  await interaction.reply(`✅ 911 call dispatched (ID: ${callId})`);
}

module.exports = {
  // Server management
  shutdownServer,
  syncTeamRoles,
  
  // Modals (for Discord interactions)
  createBanAppealModal,
  createCharacterGeneratorModal,
  create911CallModal,
  
  // UI embeds
  createServerInfoEmbed,
  
  // Analytics
  getShiftAnalytics,
  getInfractionAnalytics,
  getKillAnalytics,
  
  // Event handlers
  handle911Call,
};
