const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('../db/database');

// A well-established, purpose-built library, not hand-rolled, on purpose:
// session handling has real security implications (fixation, concurrent
// write races) that are worth not reinventing now that this needs to work
// correctly over a real network connection instead of a synchronous local
// file. Reuses the bot's own pg Pool rather than opening a second one.
function buildSessionStore() {
  return new pgSession({
    pool,
    tableName: 'web_sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 60, // seconds; sweep expired rows hourly
  });
}

module.exports = { buildSessionStore };
