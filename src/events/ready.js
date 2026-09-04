const { Events, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { startWebServer } = require('../web/server');

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

    // Started here, not in index.js, because the dashboard's guild list
    // reads from client.guilds.cache, which Discord.js populates during the
    // gateway READY dispatch before this event fires. Starting it any
    // earlier would risk an empty cache on the first request after boot.
    startWebServer(client);
  },
};
