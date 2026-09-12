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
 * Check if ERLC server is started and has minimum player count
 */
async function checkSsuStatus(guildId, minPlayers = 25) {
  try {
    const client = await getErlcClient(guildId);
    if (!client) {
      return { ready: false, reason: 'No ERLC API configured' };
    }

    const status = await client.getServerStatus();
    if (!status || status.status !== 'started') {
      return { ready: false, reason: 'Server not started' };
    }

    const players = await client.getPlayers();
    const playerCount = Array.isArray(players) ? players.length : 0;
    
    if (playerCount < minPlayers) {
      return { ready: false, reason: `Only ${playerCount}/${minPlayers} players in-game`, playerCount, minPlayers };
    }

    return { ready: true, playerCount };
  } catch (err) {
    console.error(`[erlc] SSU status check failed: ${err.message}`);
    return { ready: false, reason: 'Failed to check server status' };
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
 * Handle verify button click
 * Fetch Roblox profile and check if bio contains verification phrase
 */
async function handleErlcVerifyButton(interaction) {
  const { getVerificationCode, verifyBioPhrase, clearVerificationCode } = require('../utils/robloxVerification');
  
  const discordUserId = interaction.user.id;
  const phrase = getVerificationCode(discordUserId, interaction.guildId);
  
  if (!phrase) {
    return interaction.reply({
      content: 'Verification phrase expired. Run `/erlc-link` again to get a new phrase.',
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // First, we need to know their Roblox username
    // For now, ask them to provide it via modal or we can use a temporary store
    // Since they haven't verified yet, we need to ask for the username
    
    // Actually, let's use a different approach: we'll use a modal to ask for their username,
    // then verify the bio contains the phrase
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
    
    const modal = new ModalBuilder()
      .setCustomId(`erlc_verify_username_${interaction.user.id}`)
      .setTitle('Enter Your Roblox Username');

    const usernameInput = new TextInputBuilder()
      .setCustomId('roblox_username')
      .setLabel('Roblox Username')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('e.g. YourRobloxUsername');

    const row = new ActionRowBuilder().addComponents(usernameInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  } catch (err) {
    console.error(`[erlc] Verify button error: ${err.message}`);
    await interaction.editReply({
      content: `Verification failed: ${err.message}`,
    });
  }
}

/**
 * Handle regenerate button click
 * Generate a new verification phrase
 */
async function handleErlcRegenerateButton(interaction) {
  const { generateVerificationPhrase, storeVerificationCode } = require('../utils/robloxVerification');
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  
  const phrase = generateVerificationPhrase();
  await storeVerificationCode(interaction.user.id, interaction.guildId, phrase);

  const embed = new EmbedBuilder()
    .setTitle('New Verification Phrase Generated')
    .setDescription('Here is your new phrase. Copy it to your Roblox bio.')
    .addFields(
      {
        name: 'Your phrase',
        value: `\`\`\`\n${phrase}\n\`\`\``,
        inline: false,
      }
    )
    .setColor(0xcba6f7)
    .setFooter({ text: 'Expires in 1 hour' });

  const verifyButton = new ButtonBuilder()
    .setCustomId(`erlc_verify_${interaction.user.id}`)
    .setLabel('Verify My Account')
    .setStyle(ButtonStyle.Primary);

  const regenerateButton = new ButtonBuilder()
    .setCustomId(`erlc_regenerate_${interaction.user.id}`)
    .setLabel('Regenerate Words')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('🔄');

  const row = new ActionRowBuilder().addComponents(verifyButton, regenerateButton);

  await interaction.update({
    embeds: [embed],
    components: [row],
  });
}

/**
 * Handle verification username modal (step 2 of verification)
 * User enters Roblox username, bot checks if bio contains phrase
 */
async function handleErlcVerifyUsernameModal(interaction) {
  const { getVerificationCode, verifyBioPhrase, clearVerificationCode } = require('../utils/robloxVerification');
  const { setInGameModStatus } = require('../db/database');
  
  const robloxUsername = interaction.fields.getTextInputValue('roblox_username');

  if (!robloxUsername || robloxUsername.trim().length === 0) {
    return interaction.reply({
      content: 'Please enter a valid Roblox username.',
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const client = await getErlcClient(interaction.guildId);
    if (!client) {
      return interaction.editReply({
        content: 'ERLC is not configured for this server. Contact an admin.',
      });
    }

    // Fetch Roblox profile with bio
    const profile = await client.getRobloxProfile(robloxUsername.trim());
    const phrase = getVerificationCode(interaction.user.id, interaction.guildId);

    if (!phrase) {
      return interaction.editReply({
        content: 'Verification phrase expired. Run `/erlc-link` again.',
      });
    }

    // Check if bio contains the verification phrase
    const bioValid = verifyBioPhrase(profile.bio, phrase);
    
    if (!bioValid) {
      return interaction.editReply({
        content: `Verification failed. Your Roblox bio does not contain the phrase:\n\n\`\`\`\n${phrase}\n\`\`\`\n\nPlease add it to your bio at https://www.roblox.com/my/settings/account and try again.`,
      });
    }

    // Bio verification successful - link account
    await linkRobloxAccount(interaction.guildId, interaction.user.id, profile.displayName || profile.username);

    // Check if user is staff
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isStaff = member.roles.cache.some(r => {
      const name = r.name.toLowerCase();
      return name.includes('admin') || name.includes('manager') || 
             name.includes('staff') || name.includes('moderator') ||
             name.includes('lead');
    });

    if (isStaff) {
      await setInGameModStatus(interaction.guildId, interaction.user.id, true);
      await interaction.editReply({
        content: `✓ Account **${profile.displayName}** verified and linked. You can now use \`?moderate\` commands in-game.`,
      });
    } else {
      await interaction.editReply({
        content: `✓ Account **${profile.displayName}** verified and linked.`,
      });
    }

    clearVerificationCode(interaction.user.id, interaction.guildId);
  } catch (err) {
    console.error(`[erlc] Verification error: ${err.message}`);
    await interaction.editReply({
      content: `Verification failed: ${err.message}. Make sure the username is correct and try again.`,
    });
  }
}

/**
 * Handle ERLC link modal submission (legacy, kept for backwards compat)
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

    // Check if user is staff - if so, enable in-game mod status
    const { setInGameModStatus } = require('../db/database');
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isStaff = member.roles.cache.some(r => {
      const name = r.name.toLowerCase();
      return name.includes('admin') || name.includes('manager') || 
             name.includes('staff') || name.includes('moderator') ||
             name.includes('lead');
    });

    if (isStaff) {
      await setInGameModStatus(interaction.guildId, interaction.user.id, true);
      return interaction.reply({
        content: `✓ Your Roblox account **${robloxUsername}** has been linked. You can now use \`?moderate\` commands in-game.`,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `✓ Your Roblox account **${robloxUsername}** has been linked.`,
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
  checkSsuStatus,
  setErlcApiKey,
  linkRobloxAccount,
  getRobloxUsername,
  syncShiftToErlc,
  getCurrentPlayers,
  getServerInfo,
  handleErlcLinkModal,
  handleErlcVerifyButton,
  handleErlcRegenerateButton,
  handleErlcVerifyUsernameModal,
};
