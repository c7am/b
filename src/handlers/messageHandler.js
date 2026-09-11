/**
 * Detect moderation commands in Discord messages
 * Allows staff to report moderation actions via Discord
 * Complements ERLC event listener with immediate processing
 */

const { ChannelType } = require('discord.js');
const { parseModCommand } = require('./inGameModerationHandler');
const { logInGameModeration } = require('./inGameModerationHandler');

/**
 * Handle incoming messages for moderation commands
 * Listens for ?moderate PlayerName violation reason in designated channels
 */
async function handleModerationMessage(message) {
  // Ignore bot messages and DMs
  if (message.author.bot || !message.guild) return;
  
  // Check if message contains moderation command
  if (!message.content.toLowerCase().includes('?moderate')) return;

  const parsed = parseModCommand(message.content);
  if (!parsed) return; // Not a valid ?moderate command

  // Check if user has staff role
  const member = message.member;
  if (!member) return;

  const isStaff = member.roles.cache.some(r => {
    const name = r.name.toLowerCase();
    return name.includes('admin') || name.includes('manager') || 
           name.includes('staff') || name.includes('moderator') ||
           name.includes('lead');
  });

  if (!isStaff) {
    return message.reply({
      content: 'You do not have permission to use moderation commands.',
      allowedMentions: { repliedUser: false },
    }).catch(() => null);
  }

  // Process the moderation command
  try {
    const result = await logInGameModeration(message.client, message.guildId, message.author.username, message.author.id, {
      playerName: parsed.playerName,
      violationId: parsed.violationId,
      reason: parsed.reason,
    });

    if (result.success) {
      // React with success emoji
      await message.react('✓').catch(() => null);
      
      // Reply with brief confirmation
      await message.reply({
        content: `Moderation logged: **${result.player}** (${result.violation})`,
        allowedMentions: { repliedUser: false },
      }).catch(() => null);
    } else {
      await message.reply({
        content: `Failed to log: ${result.error}`,
        allowedMentions: { repliedUser: false },
      }).catch(() => null);
    }
  } catch (err) {
    console.error(`[mod-msg] Failed to process moderation command: ${err.message}`);
    await message.reply({
      content: `Error: ${err.message}`,
      allowedMentions: { repliedUser: false },
    }).catch(() => null);
  }
}

module.exports = {
  handleModerationMessage,
};
