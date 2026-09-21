const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const { initDatabase } = require('./db/database');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// =========================================================================
// LOAD COMMANDS
// =========================================================================
const commandsDir = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsDir).filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsDir, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`[cmd] ${command.data.name}`);
  }
}

// =========================================================================
// LOAD EVENTS
// =========================================================================
const eventsDir = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsDir, file));
  if (event.name && event.execute) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`[evt] ${event.name}`);
  }
}

// Schema must exist before login
async function main() {
  await initDatabase();
  
  // Set up ready listener BEFORE login
  const { startWebServer } = require('./web/server');
  let webServer = null;
  let webServerError = null;
  
  client.once(Events.ClientReady, () => {
    // Now that bot is connected, guild cache is populated
    // Start web server on first ready event
    if (!webServer) {
      try {
        webServer = startWebServer(client);
        if (webServer) {
          console.log('[boot] web server started after bot ready');
        } else {
          console.warn('[boot] web server returned null - missing env vars?');
        }
      } catch (err) {
        webServerError = err;
        console.error('[boot] web server startup failed:', err.message);
        console.warn('[boot] bot continuing without dashboard');
      }
    }
  });
  
  await client.login(TOKEN);
}

main().catch((err) => {
  console.error('[boot] failed to start:', err);
  process.exit(1);
});
