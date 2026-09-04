const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} = require('discord.js');
const { COLORS, icon, iconEmoji } = require('../config');
const { buildCard, V2 } = require('../utils/components');
const { getScalar } = require('../utils/guildConfig');

const activeVotes = new Map();

function getVoteCard(vote) {
  if (vote.started) {
    const lines = [
      `Started by ${vote.initiatedBy}`,
      '',
      `**This session is underway.** The vote hit its target of **${vote.requiredVotes}** vote${vote.requiredVotes === 1 ? '' : 's'}, the join code went out, and voting here is now closed. Scroll down for the announcement with the join code and who's expected to be there.`,
    ];
    return buildCard({
      accentColor: COLORS.green,
      heading: `${icon('vote_yes')} Session Vote: Started`,
      lines,
    });
  }

  const lines = [
    `Started by ${vote.initiatedBy}`,
    '',
    `**${vote.requiredVotes}** vote${vote.requiredVotes === 1 ? '' : 's'} ${vote.requiredVotes === 1 ? 'is' : 'are'} needed to greenlight this session. Tap the button below if you're in.`,
    '',
    "If you vote yes, **you're expected to show up.** Once the target is hit, the staff member who started this vote gets a prompt to kick things off. When they do, everyone who voted yes (plus staff) gets pinged with the join code, and failing to show up after that may result in moderation action.",
    '',
    `**${vote.yesIds.size} / ${vote.requiredVotes}** votes so far.`,
  ];

  return buildCard({
    accentColor: vote.closed ? COLORS.red : COLORS.blue,
    heading: `${icon('vote')} Session Vote`,
    lines,
  });
}

// The DM (or, if the DM fails, a fallback message tagging the initiator in
// the origin channel) sent the moment a vote first reaches its target.
function getThresholdReachedCard(vote) {
  const lines = [
    `Your session vote in <#${vote.channelId}> just hit **${vote.requiredVotes} / ${vote.requiredVotes}** votes. Everyone you needed is in.`,
    '',
    `**You're clear to start the SSU whenever you're ready.** Hit **Start Session** below and I'll ask for the join code. The moment you submit it, I'll ping every single person who voted yes, plus staff, with the code and a clear heads-up that showing up is expected.`,
    '',
    `Not ready yet? Hit **I'll Wait** and I won't touch a thing. The vote stays open, more people can still pile on votes, and these two buttons will be sitting right here whenever you want to come back to them.`,
    '',
    `-# Once the announcement goes out, anyone who voted yes and doesn't join is fair game for moderation. Staff gets pinged too so someone's actually watching for no-shows.`,
  ];

  return buildCard({
    accentColor: COLORS.blue,
    heading: `${icon('vote_yes')} Vote Target Reached: Ready to Start`,
    lines,
  });
}

function getThresholdReachedRow(uid) {
  const startBtn = new ButtonBuilder()
    .setCustomId(`ssu_start_${uid}`)
    .setLabel('Start Session')
    .setStyle(ButtonStyle.Success);
  const waitBtn = new ButtonBuilder()
    .setCustomId(`ssu_wait_${uid}`)
    .setLabel("I'll Wait")
    .setStyle(ButtonStyle.Secondary);
  return new ActionRowBuilder().addComponents(startBtn, waitBtn);
}

function getStartedConfirmationCard(vote) {
  const nowTs = Math.floor(Date.now() / 1000);
  const count = vote.yesIds.size;
  const lines = [
    `You started this session <t:${nowTs}:R>. The announcement, join code, and pings went out in <#${vote.channelId}> to **${count}** voter${count === 1 ? '' : 's'} plus staff.`,
    '',
    "Nice work getting this one across the line. Keep an eye on the channel in case anyone has questions before jumping in.",
  ];
  return buildCard({
    accentColor: COLORS.green,
    heading: `${icon('success')} Session Started`,
    lines,
  });
}

// The big, public, in-channel announcement once a staff member actually
// pulls the trigger and hands over a join code.
function buildAnnouncementCard(vote, joinCode, staffRoleId) {
  const voterMentions = [...vote.yesIds].map((id) => `<@${id}>`).join(' ');
  const staffMention = staffRoleId ? `<@&${staffRoleId}>` : null;
  const pingLine = [voterMentions, staffMention].filter(Boolean).join(' ');

  const lines = [
    pingLine,
    '',
    `**The vote passed and the SSU is live right now.** If you're tagged above by name, you voted yes on this session, which means you're expected to log in and join promptly.`,
    '',
    `**Join Code / Link**`,
    `${joinCode}`,
    '',
    `Grab that and get in as soon as you're able. **Anyone who voted yes and doesn't show up may face moderation action** since the whole point of the vote is so staff know how many people are actually committed, and a no-show after committing just holds the session up for everyone else who showed up ready to go. If something genuinely came up and you can't make it anymore, message a staff member now instead of quietly no-showing.`,
    '',
    staffRoleId
      ? `Staff: keep an eye on who actually joins and follow up with anyone from the list above who doesn't.`
      : `Staff: no Staff Manage role is configured for this server yet (set one with /config), so this only pinged voters. Worth keeping an eye on who joins regardless.`,
    '',
    `-# Started by ${vote.initiatedBy}`,
  ];

  return buildCard({
    accentColor: COLORS.green,
    heading: `${icon('vote_yes')} Session Starting: Join Now`,
    lines,
  });
}

// Fires once, the first time a vote's tally reaches its required count.
// Tries a DM to whoever ran /session-vote; if that fails (DMs closed, bot
// blocked, etc.) it falls back to a visible ping in the origin channel so
// the moment doesn't just vanish into a console log nobody reads.
async function notifyInitiatorThresholdReached(client, vote) {
  const card = getThresholdReachedCard(vote);
  const row = getThresholdReachedRow(vote.uid);

  try {
    const user = await client.users.fetch(vote.initiatorId);
    await user.send({ components: [card, row], ...V2 });
    console.log(`[session-vote] DMed ${vote.initiatorId} - vote ${vote.uid} reached its target`);
    return;
  } catch (err) {
    console.error(`[session-vote] Couldn't DM ${vote.initiatorId}, falling back to channel: ${err.message}`);
  }

  try {
    const channel = await client.channels.fetch(vote.channelId);
    await channel.send({
      content: `<@${vote.initiatorId}> your vote hit its target but I couldn't DM you (check your privacy settings). Use the buttons below whenever you're ready:`,
      components: [card, row],
      ...V2,
    });
  } catch (err) {
    console.error(`[session-vote] Fallback channel ping also failed for vote ${vote.uid}: ${err.message}`);
  }
}

function isInitiator(interaction, vote) {
  return interaction.user.id === vote.initiatorId;
}

async function handleSsuStart(interaction) {
  const vote = activeVotes.get(interaction.customId);
  if (!vote) {
    return interaction.reply({ content: `${icon('error')} This vote is no longer active.`, flags: MessageFlags.Ephemeral });
  }
  if (!isInitiator(interaction, vote)) {
    return interaction.reply({
      content: `${icon('error')} Only the staff member who started this vote can do that.`,
      flags: MessageFlags.Ephemeral,
    });
  }
  if (vote.started) {
    return interaction.reply({ content: `${icon('info')} This session has already started.`, flags: MessageFlags.Ephemeral });
  }

  const modal = new ModalBuilder().setCustomId(`ssu_joincode_${vote.uid}`).setTitle('Start the Session');
  const joinCodeInput = new TextInputBuilder()
    .setCustomId('join_code')
    .setLabel('Join Code / Private Server Link')
    .setPlaceholder('e.g. https://www.roblox.com/share?code=... or ABC-123')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(300)
    .setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(joinCodeInput));

  return interaction.showModal(modal);
}

async function handleSsuWait(interaction) {
  const vote = activeVotes.get(interaction.customId);
  if (!vote) {
    return interaction.reply({ content: `${icon('error')} This vote is no longer active.`, flags: MessageFlags.Ephemeral });
  }
  if (!isInitiator(interaction, vote)) {
    return interaction.reply({
      content: `${icon('error')} Only the staff member who started this vote can do that.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  return interaction.reply({
    content: `${icon('info')} Got it, I'll leave this here. Come back and hit **Start Session** whenever you're ready.`,
    flags: MessageFlags.Ephemeral,
  });
}

async function handleSsuJoinCodeModal(interaction) {
  const vote = activeVotes.get(interaction.customId);
  if (!vote) {
    return interaction.reply({ content: `${icon('error')} This vote is no longer active.`, flags: MessageFlags.Ephemeral });
  }
  if (!isInitiator(interaction, vote)) {
    return interaction.reply({
      content: `${icon('error')} Only the staff member who started this vote can do that.`,
      flags: MessageFlags.Ephemeral,
    });
  }
  if (vote.started) {
    return interaction.reply({ content: `${icon('info')} This session has already started.`, flags: MessageFlags.Ephemeral });
  }

  const joinCode = interaction.fields.getTextInputValue('join_code').trim();
  vote.started = true;
  vote.closed = true;
  vote.joinCode = joinCode;

  const staffRoleId = await getScalar(vote.guildId, 'staffManageRoleId');
  const announcement = buildAnnouncementCard(vote, joinCode, staffRoleId);

  try {
    const channel = await interaction.client.channels.fetch(vote.channelId);
    await channel.send({ components: [announcement], ...V2 });

    if (vote.messageId) {
      const originalMsg = await channel.messages.fetch(vote.messageId).catch(() => null);
      if (originalMsg) {
        const disabledBtn = new ButtonBuilder()
          .setCustomId(vote.buttonId)
          .setLabel('Session Started')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true);
        await originalMsg
          .edit({ components: [getVoteCard(vote), new ActionRowBuilder().addComponents(disabledBtn)], ...V2 })
          .catch((err) => console.error(`[session-vote] Failed to update original vote card: ${err.message}`));
      }
    }
  } catch (err) {
    console.error(`[session-vote] Failed to post SSU announcement for vote ${vote.uid}: ${err.message}`);
    return interaction.reply({
      content: `${icon('error')} Something went wrong posting the announcement. Check the console - your join code wasn't lost, try again.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Edits whichever message the Start/Wait buttons were attached to (the DM,
  // or the fallback channel ping if the DM had failed) to close out the flow.
  if (interaction.isFromMessage && interaction.isFromMessage()) {
    return interaction.update({ content: null, components: [getStartedConfirmationCard(vote)] });
  }
  return interaction.reply({ components: [getStartedConfirmationCard(vote)], ...V2, flags: MessageFlags.Ephemeral });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('session-vote')
    .setDescription('Start a vote to begin a roleplay session')
    .addIntegerOption((opt) => opt.setName('votes').setDescription('Votes required to start').setRequired(true).setMinValue(1)),

  async execute(interaction) {
    const requiredVotes = interaction.options.getInteger('votes', true);
    const guildId = interaction.guildId;
    const uid = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const vote = {
      uid,
      guildId,
      channelId: interaction.channelId,
      requiredVotes,
      yesIds: new Set(),
      closed: false,
      started: false,
      thresholdNotified: false,
      joinCode: null,
      initiatorId: interaction.user.id,
      initiatedBy: `<@${interaction.user.id}>`,
      messageId: null,
      buttonId: `vote_toggle_${uid}`,
    };

    const voteBtn = new ButtonBuilder()
      .setCustomId(vote.buttonId)
      .setLabel(`Vote (0/${requiredVotes})`)
      .setStyle(ButtonStyle.Success);
    const voteEmoji = iconEmoji('vote_yes');
    if (voteEmoji) voteBtn.setEmoji(voteEmoji);

    const row = new ActionRowBuilder().addComponents(voteBtn);
    const card = getVoteCard(vote);

    // Registered under every custom ID this vote will ever need to answer to
    // (toggle, start, wait, join-code modal) - all pointing at the same
    // object, so updating it from any handler is visible to all the others.
    activeVotes.set(vote.buttonId, vote);
    activeVotes.set(`ssu_start_${uid}`, vote);
    activeVotes.set(`ssu_wait_${uid}`, vote);
    activeVotes.set(`ssu_joincode_${uid}`, vote);

    const reply = await interaction.reply({
      components: [card, row],
      ...V2,
      withResponse: true,
    });

    vote.messageId = reply.resource.message.id;
    console.log(`[session-vote] ${interaction.user.tag} started a vote requiring ${requiredVotes} votes`);

    const pingRoleId = await getScalar(guildId, 'sessionPingRoleId');
    if (pingRoleId) {
      if (interaction.guild.roles.cache.has(pingRoleId)) {
        await interaction.channel
          .send(`<@&${pingRoleId}> a session vote just started, cast your vote above.`)
          .catch((err) => {
            console.error(`[session-vote] Failed to ping session role: ${err.message}`);
          });
      } else {
        console.error(
          `[session-vote] Configured Session Ping role (${pingRoleId}) no longer exists in guild ${guildId}`
        );
      }
    } else {
      console.log('[session-vote] No Session Ping role configured, skipping ping. Set one with /config.');
    }
  },

  activeVotes,
  getVoteCard,
  notifyInitiatorThresholdReached,
  handleSsuStart,
  handleSsuWait,
  handleSsuJoinCodeModal,
};
