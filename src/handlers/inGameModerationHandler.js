/**
 * In-Game Moderation Handler
 * Discord staff link Roblox accounts via /erlc-link
 * Then moderate in-game with ?moderate command
 * All moderations logged to staff member's Discord record + player notified
 */

const { getRobloxLink, setInGameModStatus, getModerationPresets, matchViolation } = require('../db/database');

/**
 * Parse in-game moderation command
 * Format: ?moderate <player_name> <violation_id> [reason]
 * Example: ?moderate PlayerName rdm Failed to cooperate with LEO
 */
function parseModCommand(messageContent) {
  const match = messageContent.match(/^\?moderate\s+(\S+)\s+(\S+)\s*(.*)?$/i);
  if (!match) return null;
  
  return {
    playerName: match[1],
    violationId: match[2].toLowerCase(),
    reason: match[3]?.trim() || 'In-game moderation',
  };
}

/**
 * Check if Discord user is still staff, revoke mod status if not
 */
async function verifyModStatus(guildId, discordUserId, guild) {
  try {
    const member = await guild.members.fetch(discordUserId);
    
    // Check for staff roles (admin, manager, staff, moderator)
    const isStaff = member.roles.cache.some(r => {
      const name = r.name.toLowerCase();
      return name.includes('admin') || name.includes('manager') || 
             name.includes('staff') || name.includes('moderator') ||
             name.includes('lead');
    });
    
    if (!isStaff) {
      // Lost staff status - revoke in-game mod perms
      await setInGameModStatus(guildId, discordUserId, false);
      return { isStaff: false, revoked: true };
    }
    
    return { isStaff: true };
  } catch (err) {
    console.error(`[mod] Failed to verify staff status for ${discordUserId}: ${err.message}`);
    return { isStaff: false, error: err.message };
  }
}

/**
 * Log in-game moderation action
 * Called when staff uses ?moderate command in ERLC
 * Returns success/error with notification data + fetched avatars
 */
async function logInGameModeration(client, guildId, robloxModName, discordModId, {
  playerName,
  violationId,
  reason,
}) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const moderator = await guild.members.fetch(discordModId).catch(() => null);
    
    if (!moderator) {
      return { success: false, error: 'Moderator not found in Discord' };
    }

    // Verify moderator is still staff
    const verification = await verifyModStatus(guildId, discordModId, guild);
    if (!verification.isStaff) {
      return { 
        success: false, 
        error: 'You are no longer a staff member and cannot moderate',
        revoked: verification.revoked,
      };
    }

    // Smart match the violation (handles typos, short codes, custom types)
    const matchedViolationId = await matchViolation(guildId, violationId);
    if (!matchedViolationId) {
      const presets = await getModerationPresets(guildId);
      const validViolations = presets.map(p => `${p.label} (${p.shortCodes.join('/')})`).join(', ');
      return { 
        success: false, 
        error: `Unknown violation "${violationId}". Valid: ${validViolations}`,
      };
    }

    // Fetch the matched violation for display
    const presets = await getModerationPresets(guildId);
    const preset = presets.find(p => p.id === matchedViolationId);
    
    if (!preset) {
      return { success: false, error: `Violation not found after match` };
    }

    // Fetch Roblox avatar for the moderated player
    const { getErlcClient } = require('./erlcHandler');
    let playerAvatar = null;
    let playerId = null;
    
    try {
      const erlcClient = await getErlcClient(guildId);
      if (erlcClient) {
        const profile = await erlcClient.getRobloxProfile(playerName);
        playerId = profile.id;
        playerAvatar = await erlcClient.getRobloxAvatar(profile.id);
      }
    } catch (avatarErr) {
      // Avatar fetch failed, continue without it
      console.warn(`[mod] Failed to fetch avatar for ${playerName}: ${avatarErr.message}`);
    }

    console.log(`[mod] ${moderator.user.username} (${robloxModName}): ${playerName} - ${preset.label} - ${reason}`);

    return { 
      success: true, 
      moderator: {
        discord: moderator.user.username,
        roblox: robloxModName,
      },
      player: playerName,
      playerId,
      playerAvatar,
      violation: preset.label,
      reason,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[mod] Failed to log moderation: ${err.message}`);
    return { success: false, error: err.message };
  }
}

module.exports = {
  parseModCommand,
  verifyModStatus,
  logInGameModeration,
};
