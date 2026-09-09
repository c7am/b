const { ErlcClient } = require('../erlc/erlcClient');
const { getScalar, setScalar } = require('../utils/guildConfig');
const { getSetting, setSetting } = require('../db/database');

/**
 * ERLC Handler - manages Discord/ERLC integration for shifts, roles, and syncing
 */

/**
 * Get or initialize ERLC client for a guild
 * Returns null if no API key is configured
 */
async function getErlcClient(guildId) {
  try {
    // Fetch API key from database (stored securely in settings)
    const apiKey = await getSetting(guildId, 'erlc_api_key');
    if (!apiKey) {
      return null;
    }
    return new ErlcClient(apiKey);
  } catch (err) {
    console.error(`[erlc] Failed to initialize client for guild ${guildId}: ${err.message}`);
    return null;
  }
}

/**
 * Verify ERLC API key is valid
 */
async function verifyApiKey(guildId, apiKey) {
  try {
    const client = new ErlcClient(apiKey);
    await client.getServerStatus();
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Store ERLC API key securely in database
 */
async function setErlcApiKey(guildId, apiKey) {
  await setSetting(guildId, 'erlc_api_key', apiKey);
}

/**
 * Link Discord user to Roblox username
 * Stores mapping for shift syncing
 */
async function linkRobloxAccount(guildId, discordUserId, robloxUsername) {
  // TODO: Create a separate table for Discord <-> Roblox mappings
  // For now, store in settings as a JSON object
  const links = await getSetting(guildId, 'discord_roblox_links') || {};
  links[discordUserId] = robloxUsername;
  await setSetting(guildId, 'discord_roblox_links', links);
}

/**
 * Get Roblox username for a Discord user
 */
async function getRobloxUsername(guildId, discordUserId) {
  const links = await getSetting(guildId, 'discord_roblox_links') || {};
  return links[discordUserId] || null;
}

/**
 * Sync Discord shift to ERLC team assignment
 * When user starts a shift in Discord, assign them to team in ERLC
 */
async function syncShiftToErlc(guildId, discordUserId, shiftType) {
  const client = await getErlcClient(guildId);
  if (!client) {
    console.warn(`[erlc] No ERLC client for guild ${guildId}, skipping shift sync`);
    return null;
  }

  const robloxUsername = await getRobloxUsername(guildId, discordUserId);
  if (!robloxUsername) {
    console.warn(`[erlc] No Roblox username linked for user ${discordUserId}`);
    return { error: 'Roblox account not linked' };
  }

  try {
    // Get player details to find their player ID
    const playerDetails = await client.getPlayerDetails(robloxUsername);
    const playerId = playerDetails.id || playerDetails.playerId;

    // Map shift type to ERLC team ID (configurable per guild)
    const shiftTypeToTeam = await getSetting(guildId, 'shift_type_team_map') || {};
    const teamId = shiftTypeToTeam[shiftType];

    if (!teamId) {
      console.warn(`[erlc] No team ID configured for shift type ${shiftType}`);
      return { error: `Shift type ${shiftType} not configured for ERLC sync` };
    }

    // Assign player to team
    await client.setPlayerTeam(playerId, teamId);
    console.log(`[erlc] Synced shift: ${robloxUsername} assigned to team ${teamId}`);

    return { success: true, playerId, teamId };
  } catch (err) {
    console.error(`[erlc] Failed to sync shift: ${err.message}`);
    return { error: err.message };
  }
}

/**
 * Get list of current ERLC players for display
 */
async function getCurrentPlayers(guildId) {
  const client = await getErlcClient(guildId);
  if (!client) {
    return { error: 'ERLC not configured' };
  }

  try {
    const players = await client.getPlayers();
    return { success: true, players };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Get ERLC server status and stats
 */
async function getServerInfo(guildId) {
  const client = await getErlcClient(guildId);
  if (!client) {
    return { error: 'ERLC not configured' };
  }

  try {
    const status = await client.getServerStatus();
    const teams = await client.getTeams();
    return { success: true, status, teams };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Handle ERLC link modal submission
 */
async function handleErlcLinkModal(interaction) {
  const robloxUsername = interaction.fields.getTextInputValue('roblox_username');

  if (!robloxUsername || robloxUsername.trim().length === 0) {
    return interaction.reply({
      content: 'Please enter a valid Roblox username.',
      ephemeral: true,
    });
  }

  try {
    // Verify the username exists in ERLC by querying player details
    const client = await getErlcClient(interaction.guildId);
    if (!client) {
      return interaction.reply({
        content: 'ERLC is not configured for this server. Contact an admin.',
        ephemeral: true,
      });
    }

    // Verify username exists
    await client.getPlayerDetails(robloxUsername);

    // Link the account
    await linkRobloxAccount(interaction.guildId, interaction.user.id, robloxUsername);

    return interaction.reply({
      content: `✓ Your Roblox account **${robloxUsername}** has been linked. Shifts will now sync to ERLC automatically.`,
      ephemeral: true,
    });
  } catch (err) {
    return interaction.reply({
      content: `Failed to verify Roblox username: ${err.message}. Make sure the username is correct and you're registered on the ERLC server.`,
      ephemeral: true,
    });
  }
}

module.exports = {
  getErlcClient,
  verifyApiKey,
  setErlcApiKey,
  linkRobloxAccount,
  getRobloxUsername,
  syncShiftToErlc,
  getCurrentPlayers,
  getServerInfo,
  handleErlcLinkModal,
};
