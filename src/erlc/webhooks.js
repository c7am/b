/**
 * ERLC Webhook Event Handler
 * Receives real-time join/leave/kill/command events from ERLC servers
 * 
 * Webhook format (from ERLC API):
 * POST https://your-domain.com/erlc/webhook
 * {
 *   "EventType": "PlayerJoined|PlayerLeft|PlayerKilled|CommandExecuted",
 *   "ServerKey": "...",
 *   "Timestamp": 1234567890,
 *   "Player": "PlayerName:12345",
 *   "Killer": "KillerName:67890" (kill events only),
 *   "Weapon": "9mm" (kill events only),
 *   "Command": ":kick Player" (command events only)
 * }
 */

const erlcDb = require('./database');
const db = require('../db/database');

async function handleERLCWebhook(req, res, discordClient) {
  try {
    const event = req.body;
    const { EventType, ServerKey, Timestamp, Player, Killer, Weapon, Command } = event;

    if (!EventType || !ServerKey) {
      return res.status(400).json({ error: 'Missing EventType or ServerKey' });
    }

    // Find guild config for this server key
    const guildConfig = await db.getGuildByErlcKey(ServerKey);
    if (!guildConfig) {
      console.log(`[erlc-webhook] No guild found for server key: ${ServerKey}`);
      return res.status(400).json({ error: 'Server key not registered' });
    }

    const guildId = guildConfig.guild_id;
    const guild = discordClient.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(400).json({ error: 'Guild not found' });
    }

    // Get the configured log channels
    const logChannelId = guildConfig.erlc_log_channel;
    const logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;

    switch (EventType) {
      case 'PlayerJoined': {
        const [playerName, playerId] = Player.split(':');
        console.log(`[erlc-join] ${playerName} (${playerId}) joined server ${ServerKey}`);
        if (logChannel) {
          await logChannel.send(`✅ **${playerName}** joined the server`);
        }
        break;
      }

      case 'PlayerLeft': {
        const [playerName, playerId] = Player.split(':');
        console.log(`[erlc-leave] ${playerName} (${playerId}) left server ${ServerKey}`);
        if (logChannel) {
          await logChannel.send(`❌ **${playerName}** left the server`);
        }
        break;
      }

      case 'PlayerKilled': {
        const [killerName, killerId] = Killer.split(':');
        const [victimName, victimId] = Player.split(':');
        console.log(`[erlc-kill] ${victimName} killed by ${killerName} (${Weapon})`);
        if (logChannel) {
          await logChannel.send(`💀 **${victimName}** killed by **${killerName}** (${Weapon})`);
        }
        // Auto-log kill for moderation tracking (no infraction, just audit)
        await erlcDb.logAuditEntry(guildId, 'player_killed', killerId, killerName, victimId, victimName, { weapon: Weapon });
        break;
      }

      case 'CommandExecuted': {
        const [executorName, executorId] = Player.split(':');
        console.log(`[erlc-command] ${executorName} executed: ${Command}`);
        if (logChannel) {
          await logChannel.send(`⚙️ **${executorName}** executed: \`${Command}\``);
        }
        // Auto-log for audit trail
        await erlcDb.logAuditEntry(guildId, 'command_executed', executorId, executorName, null, null, { command: Command });
        break;
      }

      default:
        console.log(`[erlc-webhook] Unknown event type: ${EventType}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[erlc-webhook] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { handleERLCWebhook };
