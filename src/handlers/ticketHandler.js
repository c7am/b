const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  AttachmentBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');
const { COLORS, icon, iconEmoji } = require('../config');
const { buildCard, V2 } = require('../utils/components');
const { getScalar } = require('../utils/guildConfig');
const { isTicketStaff } = require('../utils/permissions');
const { createTicket, setTicketChannel, getTicketByChannel, closeTicket } = require('../db/database');

const CATEGORY_LABELS = {
  general: 'General',
  management: 'Management',
  partnership: 'Partnership',
  ownership: 'Ownership',
};

// Selecting a category opens the detail modal directly - no separate button.
async function handleTicketSelectChange(interaction) {
  const category = interaction.values[0];
  const label = CATEGORY_LABELS[category] || 'Support';

  const modal = new ModalBuilder()
    .setCustomId(`ticket_create_modal_${category}`)
    .setTitle(`${label} Ticket`);

  const descInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Please describe your issue in detail')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Include as much detail as possible.')
    .setRequired(true)
    .setMaxLength(1000);

  modal.addComponents(new ActionRowBuilder().addComponents(descInput));
  await interaction.showModal(modal);
}

function sanitize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'user';
}

async function handleTicketModalSubmit(interaction) {
  const guildId = interaction.guildId;
  const categoryMatch = interaction.customId.match(/ticket_create_modal_(\w+)/);
  const category = categoryMatch ? categoryMatch[1] : 'general';
  const categoryLabel = CATEGORY_LABELS[category] || 'Support';

  const ticketStaffRoleId = await getScalar(guildId, 'ticketStaffRoleId');
  const ticketCategoryId = await getScalar(guildId, 'ticketCategoryId');
  const description = interaction.fields.getTextInputValue('description');

  const ticketId = await createTicket({
    guildId,
    userId: interaction.user.id,
    category,
    description,
  });

  const overwrites = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: interaction.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    },
  ];
  if (ticketStaffRoleId) {
    overwrites.push({
      id: ticketStaffRoleId,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    });
  }

  let channel;
  try {
    channel = await interaction.guild.channels.create({
      name: `${sanitize(interaction.user.username)}-${category}-${ticketId}`,
      type: ChannelType.GuildText,
      parent: ticketCategoryId || undefined,
      permissionOverwrites: overwrites,
      topic: `Ticket #${ticketId} - ${categoryLabel} - opened by ${interaction.user.tag} (${interaction.user.id})`,
    });
  } catch (err) {
    console.error(`[ticket] Channel creation failed for ${interaction.user.tag}: ${err.message}`);
    const card = buildCard({
      accentColor: COLORS.red,
      heading: `${icon('error')} Couldn't Create the Ticket`,
      lines: [
        `Discord returned an error trying to create the channel: ${err.message}`,
        "\nMake sure the bot has permission to **manage channels**, and that the configured ticket category (if any) still exists.",
      ],
    });
    return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
  }

  await setTicketChannel(ticketId, channel.id);

  const closeButton = new ButtonBuilder()
    .setCustomId('ticket_close')
    .setLabel('Close & Delete')
    .setStyle(ButtonStyle.Danger);
  const closeEmoji = iconEmoji('ticket_closed');
  if (closeEmoji) closeButton.setEmoji(closeEmoji);

  const summaryLines = [
    `Opened by ${interaction.user}. A member of staff will be with you as soon as they're able. Thanks for your patience.`,
    `\n**Details provided:**\n${description}`,
  ];
  if (ticketStaffRoleId) summaryLines.push(`\n<@&${ticketStaffRoleId}>`);
  summaryLines.push(`\n-# Only staff or the person who opened this ticket can close it. Hit **Close & Delete** below once this is resolved.`);

  const summaryCard = buildCard({
    accentColor: COLORS.mauve,
    heading: `${icon('ticket_open')} Ticket #${ticketId}: ${categoryLabel}`,
    lines: summaryLines,
    thumbnailUrl: interaction.user.displayAvatarURL({ size: 256 }),
    buttons: [closeButton],
  });

  await channel.send({ components: [summaryCard], ...V2 });
  console.log(`[ticket] ${interaction.user.tag} opened ticket #${ticketId} (${category}): #${channel.name}`);

  const confirmCard = buildCard({
    accentColor: COLORS.green,
    heading: `${icon('success')} Ticket Created`,
    lines: [`Your ticket has been created: ${channel}. Head over there and a member of staff will pick it up shortly.`],
  });
  await interaction.reply({ components: [confirmCard], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
}

// Pulls the channel's full message history (oldest first) and renders it as
// plain text for the transcript. Paginates in batches of 100 since that's
// Discord's per-request cap.
async function buildTranscript(channel, ticket, closedByUsername) {
  const allMessages = [];
  let before;

  while (true) {
    const batch = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) });
    if (!batch.size) break;
    allMessages.push(...batch.values());
    before = batch.last().id;
    if (batch.size < 100) break;
  }

  allMessages.reverse(); // oldest first

  const header = [
    `Ticket #${ticket.id} - ${CATEGORY_LABELS[ticket.category] || ticket.category}`,
    `Opened by ${ticket.user_id} at ${new Date(ticket.opened_at).toISOString()}`,
    `Reason: ${ticket.description}`,
    '-'.repeat(60),
  ];

  const body = allMessages.map((m) => {
    const attachments = m.attachments.size ? ` [${m.attachments.size} attachment(s)]` : '';
    return `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}${attachments}`;
  });

  const footer = ['-'.repeat(60), `Closed by ${closedByUsername} at ${new Date().toISOString()}`];

  return [...header, ...body, ...footer].join('\n');
}

function openerIdFromTopic(channel) {
  return channel.topic?.match(/\((\d+)\)/)?.[1] || null;
}

async function handleTicketClose(interaction) {
  const ticket = await getTicketByChannel(interaction.channel.id);

  if (ticket?.closed_at) {
    // Someone already hit Close & Delete a moment ago (or a race between two
    // clicks); avoid double-building the transcript and double-scheduling
    // the delete.
    return interaction.reply({
      content: `${icon('info')} This ticket is already closing.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  const openerId = ticket?.user_id || openerIdFromTopic(interaction.channel);
  const isOpener = openerId === interaction.user.id;

  if (!(await isTicketStaff(interaction.member, interaction.guildId)) && !isOpener) {
    console.error(`[ticket] ${interaction.user.tag} attempted to close a ticket without permission`);
    const card = buildCard({
      accentColor: COLORS.red,
      heading: `${icon('error')} Permission Denied`,
      lines: ["You don't have permission to close this ticket. Only **Ticket Staff** or the person who opened it can do that."],
    });
    return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
  }

  const card = buildCard({
    accentColor: COLORS.red,
    heading: `${icon('ticket_closed')} Ticket Closed`,
    lines: [`This ticket was closed by ${interaction.user}. The channel will be deleted in a few seconds. Grab anything you need from it now if you haven't already.`],
  });

  await interaction.reply({ components: [card], ...V2 });
  console.log(`[ticket] ${interaction.user.tag} closed #${interaction.channel.name}`);

  // Build and save the transcript before the channel disappears.
  if (ticket) {
    try {
      const transcript = await buildTranscript(interaction.channel, ticket, interaction.user.username);
      await closeTicket({ channelId: interaction.channel.id, closedBy: interaction.user.id, transcript });

      const logChannelId = await getScalar(interaction.guildId, 'logChannelId');
      if (logChannelId) {
        const logChannel = await interaction.guild.channels.fetch(logChannelId).catch((err) => {
          console.error(`[ticket] Failed to fetch log channel for transcript: ${err.message}`);
          return null;
        });
        if (logChannel?.isTextBased()) {
          const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), {
            name: `ticket-${ticket.id}-transcript.txt`,
          });
          const transcriptCard = buildCard({
            accentColor: COLORS.lavender,
            heading: `${icon('transcript')} Ticket #${ticket.id} Transcript`,
            lines: [
              `**Category:** ${CATEGORY_LABELS[ticket.category] || ticket.category}`,
              `**Opened by:** <@${ticket.user_id}>`,
              `**Closed by:** ${interaction.user}`,
              `\nFull message log for this ticket is attached below.`,
            ],
          });
          await logChannel.send({ components: [transcriptCard], files: [attachment], ...V2 }).catch((err) => {
            console.error(`[ticket] Failed to send transcript to log channel: ${err.message}`);
          });
        }
      }
    } catch (err) {
      console.error(`[ticket] Failed to build transcript for ticket #${ticket.id}: ${err.message}`);
    }
  } else {
    console.error(`[ticket] No ticket record found for channel ${interaction.channel.id}, skipping transcript`);
  }

  setTimeout(() => {
    interaction.channel.delete().catch((err) => {
      console.error(`[ticket] Failed to delete channel: ${err.message}`);
    });
  }, 2000);
}

module.exports = { handleTicketSelectChange, handleTicketModalSubmit, handleTicketClose };
