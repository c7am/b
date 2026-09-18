/**
 * ERLC Feature Database Tables
 * - infractions: warn/kick/ban records per player
 * - audit_log: staff actions with timestamps
 * - shift_logs: officer shift start/end tracking
 */

async function initERLCDatabase(db) {
  // Infractions table: warn -> kick -> ban progression
  await db.exec(`
    CREATE TABLE IF NOT EXISTS infractions (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      server_key TEXT NOT NULL,
      roblox_id TEXT NOT NULL,
      roblox_name TEXT,
      infraction_type TEXT NOT NULL, -- 'warn', 'kick', 'ban'
      reason TEXT,
      staff_id TEXT,
      staff_name TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER, -- NULL = permanent
      UNIQUE(guild_id, server_key, roblox_id, infraction_type, created_at)
    )
  `);

  // Audit log: who did what, when
  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      action TEXT NOT NULL, -- 'infraction', 'command_executed', 'team_sync', 'kick_override', etc.
      actor_id TEXT,
      actor_name TEXT,
      target_id TEXT, -- player/user being acted upon
      target_name TEXT,
      details TEXT, -- JSON for extra context
      created_at INTEGER NOT NULL,
      INDEX idx_guild_action (guild_id, action, created_at)
    )
  `);

  // Shift logs: officer on-duty tracking
  await db.exec(`
    CREATE TABLE IF NOT EXISTS shift_logs (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      server_key TEXT NOT NULL,
      officer_id TEXT NOT NULL,
      officer_name TEXT,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      duration_minutes INTEGER,
      shift_callsign TEXT,
      shift_department TEXT,
      created_at INTEGER NOT NULL,
      INDEX idx_guild_officer (guild_id, officer_id)
    )
  `);

  // Team/role sync config per guild
  await db.exec(`
    CREATE TABLE IF NOT EXISTS team_role_sync (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL UNIQUE,
      enabled INTEGER DEFAULT 1,
      police_role_id TEXT,
      fire_role_id TEXT,
      ems_role_id TEXT,
      tow_role_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  console.log('[db] ERLC feature tables initialized');
}

async function getInfractionCount(db, guildId, serverKey, robloxId, type = null) {
  const query = type
    ? 'SELECT COUNT(*) as count FROM infractions WHERE guild_id = ? AND server_key = ? AND roblox_id = ? AND infraction_type = ?'
    : 'SELECT COUNT(*) as count FROM infractions WHERE guild_id = ? AND server_key = ? AND roblox_id = ?';
  const params = type ? [guildId, serverKey, robloxId, type] : [guildId, serverKey, robloxId];
  const result = await db.get(query, ...params);
  return result?.count || 0;
}

async function addInfraction(db, guildId, serverKey, robloxId, robloxName, type, reason, staffId, staffName) {
  const id = `inf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.run(
    `INSERT INTO infractions (id, guild_id, server_key, roblox_id, roblox_name, infraction_type, reason, staff_id, staff_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, guildId, serverKey, robloxId, robloxName, type, reason, staffId, staffName, Date.now()
  );
  return id;
}

async function getInfractions(db, guildId, serverKey, robloxId) {
  return db.all(
    'SELECT * FROM infractions WHERE guild_id = ? AND server_key = ? AND roblox_id = ? ORDER BY created_at DESC LIMIT 50',
    guildId, serverKey, robloxId
  );
}

async function logAuditEntry(db, guildId, action, actorId, actorName, targetId, targetName, details = {}) {
  const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.run(
    `INSERT INTO audit_log (id, guild_id, action, actor_id, actor_name, target_id, target_name, details, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, guildId, action, actorId, actorName, targetId, targetName, JSON.stringify(details), Date.now()
  );
  return id;
}

async function getAuditLog(db, guildId, limit = 100, action = null) {
  const query = action
    ? 'SELECT * FROM audit_log WHERE guild_id = ? AND action = ? ORDER BY created_at DESC LIMIT ?'
    : 'SELECT * FROM audit_log WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?';
  const params = action ? [guildId, action, limit] : [guildId, limit];
  return db.all(query, ...params);
}

async function startShift(db, guildId, serverKey, officerId, officerName, callsign, department) {
  const id = `shift_${Date.now()}_${officerId}`;
  await db.run(
    `INSERT INTO shift_logs (id, guild_id, server_key, officer_id, officer_name, start_time, shift_callsign, shift_department, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, guildId, serverKey, officerId, officerName, Date.now(), callsign, department, Date.now()
  );
  return id;
}

async function endShift(db, shiftId) {
  const shift = await db.get('SELECT start_time FROM shift_logs WHERE id = ?', shiftId);
  if (!shift) throw new Error('Shift not found');
  const durationMinutes = Math.round((Date.now() - shift.start_time) / 60000);
  await db.run(
    'UPDATE shift_logs SET end_time = ?, duration_minutes = ? WHERE id = ?',
    Date.now(), durationMinutes, shiftId
  );
  return durationMinutes;
}

async function getActiveShifts(db, guildId) {
  return db.all(
    'SELECT * FROM shift_logs WHERE guild_id = ? AND end_time IS NULL ORDER BY start_time DESC',
    guildId
  );
}

module.exports = {
  initERLCDatabase,
  getInfractionCount,
  addInfraction,
  getInfractions,
  logAuditEntry,
  getAuditLog,
  startShift,
  endShift,
  getActiveShifts,
};
