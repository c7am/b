/**
 * In-Game Moderation Handler
 * Discord staff link Roblox accounts via /erlc-link
 * Then moderate in-game with ?moderate command
 * All moderations logged to staff member's Discord record + player notified
 */

const { getRobloxLink, setInGameModStatus, getModerationPresets } = require('../db/database');

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
 * Returns success/error with notification data
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

    // Get presets to validate violation
    const presets = await getModerationPresets(guildId);
    const preset = presets.find(p => p.id === violationId);
    
    if (!preset) {
      const validViolations = presets.map(p => p.id).join(', ');
      return { 
        success: false, 
        error: `Unknown violation. Valid: ${validViolations}`,
      };
    }

    console.log(`[mod] ${moderator.user.username} (${robloxModName}): ${playerName} - ${preset.label} - ${reason}`);

    return { 
      success: true, 
      moderator: {
        discord: moderator.user.username,
        roblox: robloxModName,
      },
      player: playerName,
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
