const { InteractionType, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const { icon, iconEmoji } = require('../config');
const { handleTicketSelectChange, handleTicketModalSubmit, handleTicketClose } = require('../handlers/ticketHandler');
const { handleConfigButton, handleConfigModal } = require('../handlers/configHandler');
const { activeVotes, getVoteCard, notifyInitiatorThresholdReached, handleSsuStart, handleSsuWait, handleSsuJoinCodeModal } = require('../commands/session-vote');
const { V2 } = require('../utils/components');

// Every non-slash-command handler below is routed through this so a thrown
// error still gets the user *something* useful instead of Discord's generic,
// context-free "This interaction failed." Mirrors the try/catch already
// wrapped around slash command execution further down.
async function safeHandle(interaction, handler, label) {
  try {
    await handler(interaction);
  } catch (err) {
    console.error(`${label} error:`, err);
    const payload = {
      content: `${icon('error')} Something went wrong while processing that. Check the console for details.`,
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}

async function handleVoteToggle(interaction) {
  const customId = interaction.customId;
  const vote = activeVotes.get(customId);

  if (!vote || vote.closed) {
    return interaction.reply({
      content: `${icon('error')} This vote is no longer active.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  const alreadyVoted = vote.yesIds.has(interaction.user.id);

  if (alreadyVoted) {
    vote.yesIds.delete(interaction.user.id);
    await interaction.reply({ content: `${icon('info')} Your vote has been removed.`, flags: MessageFlags.Ephemeral });
  } else {
    vote.yesIds.add(interaction.user.id);
    await interaction.reply({ content: `${icon('success')} Your vote has been recorded.`, flags: MessageFlags.Ephemeral });
  }

  const updated = getVoteCard(vote);
  const voteBtn = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(`Vote (${vote.yesIds.size}/${vote.requiredVotes})`)
    .setStyle(ButtonStyle.Success);
  const voteEmoji = iconEmoji('vote_yes');
  if (voteEmoji) voteBtn.setEmoji(voteEmoji);

  const row = new ActionRowBuilder().addComponents(voteBtn);
  await interaction.message.edit({ components: [updated, row], ...V2 }).catch((err) => {
    console.error(`[session-vote] Failed to update vote message: ${err.message}`);
  });

  if (!vote.thresholdNotified && vote.yesIds.size >= vote.requiredVotes) {
    vote.thresholdNotified = true;
    await notifyInitiatorThresholdReached(interaction.client, vote);
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (command?.autocomplete) {
        return command.autocomplete(interaction).catch((err) => {
          console.error(`Autocomplete error in /${interaction.commandName}:`, err);
        });
      }
      return;
    }

    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      return safeHandle(interaction, (i) => command.execute(i), `Command error in /${interaction.commandName}`);
    }

    // Select menus
    if (interaction.type === InteractionType.StringSelect) {
      if (interaction.customId === 'ticket_category_select') {
        return safeHandle(interaction, handleTicketSelectChange, 'Ticket select error');
      }
      return;
    }

    // Modal submissions
    if (interaction.type === InteractionType.ModalSubmit) {
      if (interaction.customId.startsWith('ticket_create_modal_')) {
        return safeHandle(interaction, handleTicketModalSubmit, 'Ticket modal error');
      }
      if (interaction.customId.startsWith('cfg_')) {
        return safeHandle(interaction, handleConfigModal, 'Config modal error');
      }
      if (interaction.customId.startsWith('ssu_joincode_')) {
        return safeHandle(interaction, handleSsuJoinCodeModal, 'SSU join code error');
      }
      return;
    }

    // Buttons
    if (!interaction.isButton()) return;

    const customId = interaction.customId;

    if (customId === 'ticket_close') {
      return safeHandle(interaction, handleTicketClose, 'Ticket close error');
    }

    if (customId.startsWith('cfg_')) {
      return safeHandle(interaction, handleConfigButton, 'Config button error');
    }

    if (customId.startsWith('vote_toggle_')) {
      return safeHandle(interaction, handleVoteToggle, 'Vote toggle error');
    }

    if (customId.startsWith('ssu_start_')) {
      return safeHandle(interaction, handleSsuStart, 'SSU start error');
    }

    if (customId.startsWith('ssu_wait_')) {
      return safeHandle(interaction, handleSsuWait, 'SSU wait error');
    }
  },
};
