/**
 * ERLC Event Listener
 * Polls ERLC server logs for in-game moderation commands (?moderate)
 * Processes and logs them to Discord
 */

const { EmbedBuilder } = require('discord.js');
const { getErlcClient } = require('../handlers/erlcHandler');
const { logInGameModeration, parseModCommand } = require('../handlers/inGameModerationHandler');
const { getRobloxLink } = require('../handlers/erlcHandler');
const { getModerationPresets } = require('../db/database');

let pollIntervals = new Map(); // Track intervals per guild

/**
 * Start polling ERLC logs for moderation commands
 * Runs every 30 seconds, checks last 60 seconds of logs
 */
async function startErlcEventListener(client, guildId) {
  // Don't start multiple listeners for same guild
  if (pollIntervals.has(guildId)) {
    console.log(`[erlc-listen] Listener already running for guild ${guildId}`);
    return;
  }

  const pollInterval = setInterval(async () => {
    try {
      const erlcClient = await getErlcClient(guildId);
      if (!erlcClient) return; // ERLC not configured for this guild

      // Fetch logs from last 90 seconds to avoid missing anything
      const logs = await erlcClient.getLogs({ since: 90 });
      if (!logs || logs.length === 0) return;

      // Filter for chat messages containing ?moderate
      const modCommands = logs.filter(log => 
        log.type === 'chat' && log.message && log.message.toLowerCase().includes('?moderate')
      );

      for (const logEntry of modCommands) {
        await processModerationCommand(client, guildId, logEntry);
      }
    } catch (err) {
      console.error(`[erlc-listen] Error polling ${guildId}: ${err.message}`);
    }
  }, 30000); // Poll every 30 seconds

  pollIntervals.set(guildId, pollInterval);
  console.log(`[erlc-listen] Started listening for guild ${guildId}`);
  
  return pollInterval;
}

/**
 * Stop polling ERLC logs for a guild
 */
function stopErlcEventListener(guildId) {
  const interval = pollIntervals.get(guildId);
  if (interval) {
    clearInterval(interval);
    pollIntervals.delete(guildId);
    console.log(`[erlc-listen] Stopped listening for guild ${guildId}`);
  }
}

/**
 * Process a single moderation command from ERLC logs
 */
async function processModerationCommand(client, guildId, logEntry) {
  try {
    const parsed = parseModCommand(logEntry.message);
    if (!parsed) return; // Not a valid ?moderate command

    // Find the moderator in Discord by their Roblox username
    // logEntry.actor is the Roblox player who typed the command
    const guild = await client.guilds.fetch(guildId);
    
    // Get all member links to find Discord user by Roblox name
    let discordModId = null;
    for (const [memberId] of guild.members.cache) {
      const link = await getRobloxLink(guildId, memberId);
      if (link && link.roblox_username.toLowerCase() === logEntry.actor?.toLowerCase()) {
        discordModId = memberId;
        break;
      }
    }

    if (!discordModId) {
      console.warn(`[erlc-listen] Moderator not found: ${logEntry.actor}`);
      return;
    }

    // Log the moderation action
    const result = await logInGameModeration(client, guildId, logEntry.actor, discordModId, {
      playerName: parsed.playerName,
      violationId: parsed.violationId,
      reason: parsed.reason,
    });

    if (result.success) {
      console.log(`[erlc-listen] Logged: ${result.moderator.discord} → ${result.player} (${result.violation})`);
      
      // Post to moderation log channel if configured
      await postModerationToDiscord(client, guildId, result);
    } else {
      console.warn(`[erlc-listen] Failed to log moderation: ${result.error}`);
    }
  } catch (err) {
    console.error(`[erlc-listen] Failed to process moderation command: ${err.message}`);
  }
}

/**
 * Post moderation log to Discord moderation channel
 */
async function postModerationToDiscord(client, guildId, modResult) {
  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return;

    // Try to find a moderation log channel
    const channels = await guild.channels.fetch();
    const modChannel = channels.find(ch => 
      ch.isTextBased() && (ch.name.includes('mod') || ch.name.includes('log'))
    );

    if (!modChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('In-Game Moderation Logged')
      .setAuthor({
        name: modResult.moderator.discord,
        iconURL: modResult.moderator.avatar || undefined,
      })
      .setDescription(`**${modResult.player}** - ${modResult.violation}`)
      .addFields(
        { name: 'Reason', value: modResult.reason || 'No reason provided', inline: false },
        { name: 'Logged At', value: new Date(modResult.timestamp).toLocaleString(), inline: false },
        { name: 'Roblox Moderator', value: modResult.moderator.roblox, inline: true }
      )
      .setColor(0xff6b6b)
      .setThumbnail(modResult.playerAvatar || null)
      .setTimestamp();

    await modChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error(`[erlc-listen] Failed to post to Discord: ${err.message}`);
  }
}

module.exports = {
  startErlcEventListener,
  stopErlcEventListener,
  processModerationCommand,
};
