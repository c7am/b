const { handleModerationMessage } = require('../handlers/messageHandler');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    // Handle moderation commands sent via Discord
    try {
      await handleModerationMessage(message);
    } catch (err) {
      console.error(`[msg] Error handling message: ${err.message}`);
    }
  },
};
