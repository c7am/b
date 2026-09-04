const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');
const { COLORS, icon } = require('../config');
const { buildCard, V2 } = require('../utils/components');
const {
  getScalar,
  setScalar,
  upsertRank,
  removeRank,
  upsertInfractionType,
  removeInfractionType,
} = require('../utils/guildConfig');

async function handleConfigButton(interaction) {
  const btnId = interaction.customId;
  const guildId = interaction.guildId;

  if (btnId === 'cfg_roles') {
    const [currentStaff, currentTicket, currentPing] = await Promise.all([
      getScalar(guildId, 'staffManageRoleId'),
      getScalar(guildId, 'ticketStaffRoleId'),
      getScalar(guildId, 'sessionPingRoleId'),
    ]);
    const modal = new ModalBuilder().setCustomId('cfg_roles_modal').setTitle('Configure Roles');
    const staffInput = new TextInputBuilder()
      .setCustomId('role_staff')
      .setLabel('Staff Manage Role ID')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 123456789012345678')
      .setRequired(false)
      .setValue(currentStaff || '');
    const ticketInput = new TextInputBuilder()
      .setCustomId('role_ticket')
      .setLabel('Ticket Staff Role ID')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 123456789012345678')
      .setRequired(false)
      .setValue(currentTicket || '');
    const pingInput = new TextInputBuilder()
      .setCustomId('role_ping')
      .setLabel('Session Ping Role ID')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 123456789012345678')
      .setRequired(false)
      .setValue(currentPing || '');
    modal.addComponents(new ActionRowBuilder().addComponents(staffInput));
    modal.addComponents(new ActionRowBuilder().addComponents(ticketInput));
    modal.addComponents(new ActionRowBuilder().addComponents(pingInput));
    await interaction.showModal(modal);
  }

  if (btnId === 'cfg_channels') {
    const [currentLog, currentTicket] = await Promise.all([
      getScalar(guildId, 'logChannelId'),
      getScalar(guildId, 'ticketCategoryId'),
    ]);
    const modal = new ModalBuilder().setCustomId('cfg_channels_modal').setTitle('Configure Channels');
    const logInput = new TextInputBuilder()
      .setCustomId('ch_log')
      .setLabel('Log Channel ID')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 123456789012345678')
      .setRequired(false)
      .setValue(currentLog || '');
    const ticketInput = new TextInputBuilder()
      .setCustomId('ch_ticket')
      .setLabel('Ticket Category ID')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 123456789012345678')
      .setRequired(false)
      .setValue(currentTicket || '');
    modal.addComponents(new ActionRowBuilder().addComponents(logInput));
    modal.addComponents(new ActionRowBuilder().addComponents(ticketInput));
    await interaction.showModal(modal);
  }

  if (btnId === 'cfg_ranks') {
    const modal = new ModalBuilder().setCustomId('cfg_ranks_modal').setTitle('Add or Remove a Rank');
    const nameInput = new TextInputBuilder()
      .setCustomId('rank_name')
      .setLabel('Rank Name')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const roleInput = new TextInputBuilder()
      .setCustomId('rank_role')
      .setLabel('Role ID (leave blank to remove)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 123456789012345678')
      .setRequired(false);
    const levelInput = new TextInputBuilder()
      .setCustomId('rank_level')
      .setLabel('Level, 1-99 (leave blank to remove)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
    modal.addComponents(new ActionRowBuilder().addComponents(roleInput));
    modal.addComponents(new ActionRowBuilder().addComponents(levelInput));
    await interaction.showModal(modal);
  }

  if (btnId === 'cfg_infra') {
    const modal = new ModalBuilder().setCustomId('cfg_infra_modal').setTitle('Add or Remove an Infraction Type');
    const nameInput = new TextInputBuilder()
      .setCustomId('infra_name')
      .setLabel('Type Name')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const pointsInput = new TextInputBuilder()
      .setCustomId('infra_points')
      .setLabel('Points (leave blank to remove)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
    modal.addComponents(new ActionRowBuilder().addComponents(pointsInput));
    await interaction.showModal(modal);
  }
}

const SNOWFLAKE = /^\d{15,25}$/;

function invalidIdCard(badFields, kind) {
  return buildCard({
    accentColor: COLORS.red,
    heading: `${icon('error')} Invalid ${kind} ID`,
    lines: [
      `${badFields.map((f) => `**${f}**`).join(', ')} ${badFields.length === 1 ? "doesn't" : "don't"} look like a real Discord ${kind.toLowerCase()} ID.`,
      `\n${kind} IDs are the long number you get from right-clicking a ${kind.toLowerCase()} with Developer Mode enabled and choosing **Copy ${kind} ID**. Nothing was saved. Fix the field${badFields.length === 1 ? '' : 's'} above and try again.`,
    ],
  });
}

async function handleConfigModal(interaction) {
  const modalId = interaction.customId;
  const guildId = interaction.guildId;

  if (modalId === 'cfg_roles_modal') {
    const staffRaw = interaction.fields.getTextInputValue('role_staff').trim();
    const ticketRaw = interaction.fields.getTextInputValue('role_ticket').trim();
    const pingRaw = interaction.fields.getTextInputValue('role_ping').trim();

    const badFields = [];
    if (staffRaw && !SNOWFLAKE.test(staffRaw)) badFields.push('Staff Manage Role');
    if (ticketRaw && !SNOWFLAKE.test(ticketRaw)) badFields.push('Ticket Staff Role');
    if (pingRaw && !SNOWFLAKE.test(pingRaw)) badFields.push('Session Ping Role');

    if (badFields.length) {
      return interaction.reply({ components: [invalidIdCard(badFields, 'Role')], ...V2, flags: MessageFlags.Ephemeral });
    }

    const staff = staffRaw || null;
    const ticket = ticketRaw || null;
    const ping = pingRaw || null;
    await Promise.all([
      setScalar(guildId, 'staffManageRoleId', staff),
      setScalar(guildId, 'ticketStaffRoleId', ticket),
      setScalar(guildId, 'sessionPingRoleId', ping),
    ]);

    return interaction.reply({
      components: [buildCard({
        accentColor: COLORS.green,
        heading: `${icon('success')} Roles Updated`,
        lines: [
          `**Staff Manage:** ${staff ? `<@&${staff}>` : '*Not set*'}`,
          `**Ticket Staff:** ${ticket ? `<@&${ticket}>` : '*Not set*'}`,
          `**Session Ping:** ${ping ? `<@&${ping}>` : '*Not set*'}`,
          '\nThese take effect immediately across every command that uses them - no restart needed.',
        ],
      })],
      ...V2,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (modalId === 'cfg_channels_modal') {
    const logRaw = interaction.fields.getTextInputValue('ch_log').trim();
    const ticketRaw = interaction.fields.getTextInputValue('ch_ticket').trim();

    const badFields = [];
    if (logRaw && !SNOWFLAKE.test(logRaw)) badFields.push('Log Channel');
    if (ticketRaw && !SNOWFLAKE.test(ticketRaw)) badFields.push('Ticket Category');

    if (badFields.length) {
      return interaction.reply({ components: [invalidIdCard(badFields, 'Channel')], ...V2, flags: MessageFlags.Ephemeral });
    }

    const log = logRaw || null;
    const ticket = ticketRaw || null;
    await Promise.all([
      setScalar(guildId, 'logChannelId', log),
      setScalar(guildId, 'ticketCategoryId', ticket),
    ]);

    return interaction.reply({
      components: [buildCard({
        accentColor: COLORS.green,
        heading: `${icon('success')} Channels Updated`,
        lines: [
          `**Log Channel:** ${log ? `<#${log}>` : '*Not set*'}`,
          `**Ticket Category:** ${ticket ? `<#${ticket}>` : '*Not set*'}`,
          '\nNew tickets and moderation logs will use these right away.',
        ],
      })],
      ...V2,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (modalId === 'cfg_ranks_modal') {
    const name = interaction.fields.getTextInputValue('rank_name').trim();
    const roleId = interaction.fields.getTextInputValue('rank_role').trim();
    const level = parseInt(interaction.fields.getTextInputValue('rank_level').trim());

    if (roleId && !SNOWFLAKE.test(roleId)) {
      return interaction.reply({ components: [invalidIdCard(['Role'], 'Role')], ...V2, flags: MessageFlags.Ephemeral });
    }

    if (roleId && !isNaN(level) && level > 0 && level <= 99) {
      await upsertRank(guildId, { name, roleId, level });
      return interaction.reply({
        components: [buildCard({
          accentColor: COLORS.green,
          heading: `${icon('success')} Rank Saved`,
          lines: [
            `**${name}** → <@&${roleId}>, level **${level}**.`,
            "\nThis rank is now available in /promote and /demote's autocomplete, and existing members with this role will be recognized as holding it.",
          ],
        })],
        ...V2,
        flags: MessageFlags.Ephemeral,
      });
    } else if (!roleId) {
      const removed = await removeRank(guildId, name);
      return interaction.reply({
        components: [buildCard({
          accentColor: removed ? COLORS.green : COLORS.red,
          heading: removed ? `${icon('success')} Rank Removed` : `${icon('error')} Not Found`,
          lines: removed
            ? [`**${name}** has been removed from the rank list. Members who currently hold its role keep the role itself - this only removes it from configuration.`]
            : [`No rank named **"${name}"** exists, so there was nothing to remove. Check /config for the exact spelling.`],
        })],
        ...V2,
        flags: MessageFlags.Ephemeral,
      });
    }
    return interaction.reply({
      components: [buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Missing Information`,
        lines: ["To **add** a rank, provide a name, a role ID, and a level from 1-99. To **remove** one, provide only the name and leave Role ID and Level blank."],
      })],
      ...V2,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (modalId === 'cfg_infra_modal') {
    const name = interaction.fields.getTextInputValue('infra_name').trim();
    const pointsStr = interaction.fields.getTextInputValue('infra_points').trim();
    const points = parseInt(pointsStr);

    if (pointsStr && !isNaN(points) && points >= 0) {
      await upsertInfractionType(guildId, { name, points });
      return interaction.reply({
        components: [buildCard({
          accentColor: COLORS.green,
          heading: `${icon('success')} Type Saved`,
          lines: [
            `**${name}**: **${points}** point${points === 1 ? '' : 's'}.`,
            "\nThis type is now available in /infract's autocomplete.",
          ],
        })],
        ...V2,
        flags: MessageFlags.Ephemeral,
      });
    } else if (!pointsStr) {
      const removed = await removeInfractionType(guildId, name);
      return interaction.reply({
        components: [buildCard({
          accentColor: removed ? COLORS.green : COLORS.red,
          heading: removed ? `${icon('success')} Type Removed` : `${icon('error')} Not Found`,
          lines: removed
            ? [`**${name}** has been removed. Past infractions of this type stay on record - this only affects new ones.`]
            : [`No infraction type named **"${name}"** exists, so there was nothing to remove. Check /config for the exact spelling.`],
        })],
        ...V2,
        flags: MessageFlags.Ephemeral,
      });
    }
    return interaction.reply({
      components: [buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Missing Information`,
        lines: ["To **add** a type, provide a name and a point value of 0 or higher. To **remove** one, provide only the name and leave Points blank."],
      })],
      ...V2,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = { handleConfigButton, handleConfigModal };
