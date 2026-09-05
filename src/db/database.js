const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. This bot stores its data in Postgres now, not a local ' +
    'file, since a local file does not survive a Render redeploy. See .env.example.'
  );
}

// Neon, Supabase, and Render's own Postgres all sit behind a certificate
// chain Node does not trust out of the box, `rejectUnauthorized: false` is
// the standard, documented workaround every one of them recommends. The
// real question is whether the target is a real remote database or a local
// one for development, NOT whether the app's own compute happens to run on
// Render, those are two different providers now. A plain local Postgres
// isn't configured for SSL at all and would fail a forced handshake.
const isLocalDb = /^(localhost|127\.0\.0\.1)$/.test(new URL(connectionString).hostname);
const pool = new Pool({
  connectionString,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  // Fired for errors on idle clients in the pool (e.g. the connection was
  // dropped by the server). Without this handler an idle-client error is an
  // unhandled 'error' event, which crashes the whole Node process.
  console.error('[db] unexpected error on idle client', err);
});

// ---------------------------------------------------------------------------
// Schema. Run once at boot via initDatabase(), awaited before the bot logs in
// or the web server starts, so nothing can query a table that doesn't exist
// yet. SERIAL, not BIGSERIAL: node-postgres returns BIGINT columns as
// strings (to avoid precision loss past 2^53), which would silently turn
// every ticket/promotion/infraction id into a string where the rest of the
// code expects a number. A single ISRP server's ticket count is nowhere
// near SERIAL's ~2.1 billion ceiling.
// ---------------------------------------------------------------------------
async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS promotions (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL DEFAULT '',
      user_id TEXT NOT NULL,
      from_rank TEXT,
      to_rank TEXT NOT NULL,
      issued_by TEXT NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS infractions (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL DEFAULT '',
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      issued_by TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_promotions_guild_user ON promotions(guild_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_infractions_guild_user ON infractions(guild_id, user_id);

    -- Scalar settings only (role/channel ids). Ranks and infraction types
    -- used to live here too as JSON blobs, moved to real tables below so
    -- add/remove can be a single atomic upsert instead of a JS-level
    -- read-modify-write, which was fine when better-sqlite3 made every call
    -- synchronous and single-threaded, but is a genuine race condition once
    -- the dashboard and a Discord command can both touch the same guild's
    -- config over the network at the same time.
    CREATE TABLE IF NOT EXISTS settings (
      guild_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      PRIMARY KEY (guild_id, key)
    );

    CREATE TABLE IF NOT EXISTS ranks (
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role_id TEXT NOT NULL,
      level INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_ranks_guild_name_ci ON ranks (guild_id, (LOWER(name)));

    CREATE TABLE IF NOT EXISTS infraction_types (
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      points INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_infraction_types_guild_name_ci ON infraction_types (guild_id, (LOWER(name)));

    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      channel_id TEXT,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      closed_at TIMESTAMPTZ,
      closed_by TEXT,
      transcript TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id);

    CREATE TABLE IF NOT EXISTS loas (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ends_at TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true
    );

    CREATE INDEX IF NOT EXISTS idx_loas_guild_active ON loas(guild_id, active);

    CREATE TABLE IF NOT EXISTS shifts (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      starts_at TIMESTAMPTZ NOT NULL,
      ends_at TIMESTAMPTZ NOT NULL,
      description TEXT,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      active BOOLEAN NOT NULL DEFAULT true
    );

    CREATE INDEX IF NOT EXISTS idx_shifts_guild_active ON shifts(guild_id, active);
    CREATE INDEX IF NOT EXISTS idx_shifts_time ON shifts(starts_at, ends_at);

    CREATE TABLE IF NOT EXISTS shift_members (
      id SERIAL PRIMARY KEY,
      shift_id INTEGER NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      checked_in BOOLEAN NOT NULL DEFAULT false,
      checked_in_at TIMESTAMPTZ,
      checked_out_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_shift_members_shift ON shift_members(shift_id);
    CREATE INDEX IF NOT EXISTS idx_shift_members_user ON shift_members(user_id);
  `);
  console.log('[db] schema ready');
}

// ---------------------------------------------------------------------------
// Promotions / infractions / history
// ---------------------------------------------------------------------------
async function addPromotion({ guildId, userId, fromRank, toRank, issuedBy, reason }) {
  await pool.query(
    `INSERT INTO promotions (guild_id, user_id, from_rank, to_rank, issued_by, reason) VALUES ($1,$2,$3,$4,$5,$6)`,
    [guildId, userId, fromRank || null, toRank, issuedBy, reason || null]
  );
}

async function addInfraction({ guildId, userId, type, points, issuedBy, reason }) {
  await pool.query(
    `INSERT INTO infractions (guild_id, user_id, type, points, issued_by, reason) VALUES ($1,$2,$3,$4,$5,$6)`,
    [guildId, userId, type, points, issuedBy, reason]
  );
}

async function getInfractionPoints(guildId, userId) {
  const res = await pool.query(
    `SELECT COALESCE(SUM(points), 0) AS total FROM infractions WHERE guild_id = $1 AND user_id = $2`,
    [guildId, userId]
  );
  return parseInt(res.rows[0].total, 10); // SUM() comes back as a string from pg, same reasoning as SERIAL above
}

// Combined, time-sorted history for /history. Scoped to one guild, since a
// staff member's record in one server has nothing to do with another.
async function getUserHistory(guildId, userId) {
  const [promotionsRes, infractionsRes] = await Promise.all([
    pool.query(`SELECT * FROM promotions WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC`, [guildId, userId]),
    pool.query(`SELECT * FROM infractions WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC`, [guildId, userId]),
  ]);
  const promotions = promotionsRes.rows.map((r) => ({ ...r, kind: 'promotion' }));
  const infractions = infractionsRes.rows.map((r) => ({ ...r, kind: 'infraction' }));
  return [...promotions, ...infractions].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

// ---------------------------------------------------------------------------
// Scalar settings (role/channel ids). Ranks and infraction types have their
// own tables below.
// ---------------------------------------------------------------------------
async function getSetting(guildId, key, fallback = null) {
  const res = await pool.query(`SELECT value FROM settings WHERE guild_id = $1 AND key = $2`, [guildId, key]);
  return res.rows[0] ? res.rows[0].value : fallback; // pg already parses jsonb back into a JS value
}

async function setSetting(guildId, key, value) {
  await pool.query(
    `INSERT INTO settings (guild_id, key, value) VALUES ($1,$2,$3)
     ON CONFLICT (guild_id, key) DO UPDATE SET value = excluded.value`,
    [guildId, key, JSON.stringify(value)]
  );
}

async function deleteSetting(guildId, key) {
  await pool.query(`DELETE FROM settings WHERE guild_id = $1 AND key = $2`, [guildId, key]);
}

// ---------------------------------------------------------------------------
// Ranks: real rows now, dedup is a case-insensitive unique index instead of
// a JS filter, so add/remove is one atomic statement, not read-then-write.
// ---------------------------------------------------------------------------
async function getRanks(guildId) {
  const res = await pool.query(`SELECT name, role_id AS "roleId", level FROM ranks WHERE guild_id = $1 ORDER BY level ASC`, [guildId]);
  return res.rows;
}

async function upsertRank(guildId, { name, roleId, level }) {
  await pool.query(
    `INSERT INTO ranks (guild_id, name, role_id, level) VALUES ($1,$2,$3,$4)
     ON CONFLICT (guild_id, (LOWER(name))) DO UPDATE SET name = excluded.name, role_id = excluded.role_id, level = excluded.level`,
    [guildId, name, roleId, level]
  );
  return getRanks(guildId);
}

async function removeRank(guildId, name) {
  const res = await pool.query(`DELETE FROM ranks WHERE guild_id = $1 AND LOWER(name) = LOWER($2)`, [guildId, name]);
  return res.rowCount > 0;
}

// ---------------------------------------------------------------------------
// Infraction types: same pattern as ranks.
// ---------------------------------------------------------------------------
async function getInfractionTypes(guildId) {
  const res = await pool.query(`SELECT name, points FROM infraction_types WHERE guild_id = $1 ORDER BY points ASC`, [guildId]);
  return res.rows;
}

async function upsertInfractionType(guildId, { name, points }) {
  await pool.query(
    `INSERT INTO infraction_types (guild_id, name, points) VALUES ($1,$2,$3)
     ON CONFLICT (guild_id, (LOWER(name))) DO UPDATE SET name = excluded.name, points = excluded.points`,
    [guildId, name, points]
  );
  return getInfractionTypes(guildId);
}

async function removeInfractionType(guildId, name) {
  const res = await pool.query(`DELETE FROM infraction_types WHERE guild_id = $1 AND LOWER(name) = LOWER($2)`, [guildId, name]);
  return res.rowCount > 0;
}

// ---------------------------------------------------------------------------
// Tickets - one row per ticket, from creation through to its saved transcript.
// The auto-incrementing id doubles as the ticket number shown in the channel
// name and in logs.
// ---------------------------------------------------------------------------
async function createTicket({ guildId, userId, category, description }) {
  const res = await pool.query(
    `INSERT INTO tickets (guild_id, user_id, category, description) VALUES ($1,$2,$3,$4) RETURNING id`,
    [guildId, userId, category, description]
  );
  return res.rows[0].id;
}

async function setTicketChannel(ticketId, channelId) {
  await pool.query(`UPDATE tickets SET channel_id = $1 WHERE id = $2`, [channelId, ticketId]);
}

async function getTicketByChannel(channelId) {
  const res = await pool.query(`SELECT * FROM tickets WHERE channel_id = $1`, [channelId]);
  return res.rows[0] || null;
}

async function closeTicket({ channelId, closedBy, transcript }) {
  await pool.query(
    `UPDATE tickets SET closed_at = now(), closed_by = $1, transcript = $2 WHERE channel_id = $3`,
    [closedBy, transcript, channelId]
  );
}

// ---------------------------------------------------------------------------
// Shifts
// ---------------------------------------------------------------------------
async function createShift({ guildId, name, startsAt, endsAt, description, createdBy }) {
  const res = await pool.query(
    `INSERT INTO shifts (guild_id, name, starts_at, ends_at, description, created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [guildId, name, startsAt, endsAt, description || null, createdBy]
  );
  return res.rows[0].id;
}

async function getShifts(guildId, { active = true, upcoming = false } = {}) {
  let query = `SELECT * FROM shifts WHERE guild_id = $1`;
  const params = [guildId];
  
  if (active) {
    query += ` AND active = true`;
  }
  if (upcoming) {
    query += ` AND starts_at > now()`;
  }
  
  query += ` ORDER BY starts_at DESC`;
  const res = await pool.query(query, params);
  return res.rows;
}

async function getShift(shiftId) {
  const res = await pool.query(`SELECT * FROM shifts WHERE id = $1`, [shiftId]);
  return res.rows[0] || null;
}

async function deleteShift(shiftId) {
  const res = await pool.query(`UPDATE shifts SET active = false WHERE id = $1`, [shiftId]);
  return res.rowCount > 0;
}

async function joinShift(shiftId, userId) {
  try {
    await pool.query(
      `INSERT INTO shift_members (shift_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [shiftId, userId]
    );
    return true;
  } catch {
    return false;
  }
}

async function leaveShift(shiftId, userId) {
  const res = await pool.query(`DELETE FROM shift_members WHERE shift_id = $1 AND user_id = $2`, [shiftId, userId]);
  return res.rowCount > 0;
}

async function getShiftMembers(shiftId) {
  const res = await pool.query(
    `SELECT * FROM shift_members WHERE shift_id = $1 ORDER BY joined_at ASC`,
    [shiftId]
  );
  return res.rows;
}

async function getUserShifts(userId, guildId) {
  const res = await pool.query(
    `SELECT s.* FROM shifts s
     INNER JOIN shift_members sm ON s.id = sm.shift_id
     WHERE sm.user_id = $1 AND s.guild_id = $2 AND s.active = true
     ORDER BY s.starts_at DESC`,
    [userId, guildId]
  );
  return res.rows;
}

// ---------------------------------------------------------------------------
// User management (view user history, infractions, LOAs, rank)
// ---------------------------------------------------------------------------
async function getUser(guildId, userId) {
  const infractions = await pool.query(
    `SELECT type, points, reason, issued_by, created_at FROM infractions WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
    [guildId, userId]
  );
  const loa = await getActiveLoa(guildId, userId);
  const promotions = await pool.query(
    `SELECT from_rank, to_rank, issued_by, reason, created_at FROM promotions WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
    [guildId, userId]
  );
  const currentShifts = await getUserShifts(userId, guildId);
  
  return {
    userId,
    infractions: infractions.rows,
    activeLoa: loa,
    promotions: promotions.rows,
    currentShifts,
  };
}

module.exports = {
  pool,
  initDatabase,
  addPromotion,
  addInfraction,
  getInfractionPoints,
  getUserHistory,
  getSetting,
  setSetting,
  deleteSetting,
  getRanks,
  upsertRank,
  removeRank,
  getInfractionTypes,
  upsertInfractionType,
  removeInfractionType,
  createTicket,
  setTicketChannel,
  getTicketByChannel,
  closeTicket,
  startLoa,
  getActiveLoa,
  endLoa,
  getActiveLoas,
  createShift,
  getShifts,
  getShift,
  deleteShift,
  joinShift,
  leaveShift,
  getShiftMembers,
  getUserShifts,
  getUser,
};
