const { Events, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { startErlcEventListener } = require('../erlc/erlcEventListener');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`\n[bot] ${client.user.tag} is online`);

    const TOKEN = process.env.DISCORD_TOKEN;
    const CLIENT_ID = process.env.CLIENT_ID;
    const GUILD_ID = process.env.GUILD_ID;

    const commands = client.commands.map((cmd) => cmd.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
      const registered = await rest.put(
        GUILD_ID ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) : Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log(`[sync] ${registered.length} slash commands registered`);
    } catch (err) {
      console.error('Failed to register commands:', err);
    }

    // Web server now starts in src/index.js main() before bot login,
    // so it binds a port immediately for Render's health check.

    // Start ERLC event listeners for all guilds
    for (const [guildId] of client.guilds.cache) {
      try {
        await startErlcEventListener(client, guildId);
      } catch (err) {
        console.warn(`[erlc-listen] Failed to start listener for guild ${guildId}: ${err.message}`);
      }
    }
  },
};
