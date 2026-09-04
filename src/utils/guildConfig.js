const {
  getSetting, setSetting,
  getRanks, upsertRank, removeRank,
  getInfractionTypes, upsertInfractionType, removeInfractionType,
} = require('../db/database');

// Keys that are simple scalars (role IDs / channel IDs).
const SCALAR_KEYS = {
  staffManageRoleId: 'Staff Manage role',
  ticketStaffRoleId: 'Ticket Staff role',
  sessionPingRoleId: 'Session Ping role',
  logChannelId: 'Log channel',
  ticketCategoryId: 'Ticket category',
};

async function getScalar(guildId, key) {
  return getSetting(guildId, key, null);
}

async function setScalar(guildId, key, value) {
  return setSetting(guildId, key, value);
}

module.exports = {
  SCALAR_KEYS,
  getScalar,
  setScalar,
  getRanks,
  upsertRank,
  removeRank,
  getInfractionTypes,
  upsertInfractionType,
  removeInfractionType,
};
