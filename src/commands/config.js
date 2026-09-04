const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ActionRowBuilder,
} = require('discord.js');
const { COLORS, icon } = require('../config');
const { buildCard, V2 } = require('../utils/components');
const {
  getScalar,
  getRanks,
  getInfractionTypes,
} = require('../utils/guildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('View and manage the server configuration')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const [ranks, types, staffRoleId, ticketRoleId, pingRoleId, logChannelId, ticketCategoryId] = await Promise.all([
      getRanks(guildId),
      getInfractionTypes(guildId),
      getScalar(guildId, 'staffManageRoleId'),
      getScalar(guildId, 'ticketStaffRoleId'),
      getScalar(guildId, 'sessionPingRoleId'),
      getScalar(guildId, 'logChannelId'),
      getScalar(guildId, 'ticketCategoryId'),
    ]);

    const lines = [
      "Here's the current configuration for this server. Use the buttons below to make changes to any section.",
      '',
      '**Roles**',
      `Staff Manage: ${staffRoleId ? `<@&${staffRoleId}>` : '*Not set*'}`,
      `Ticket Staff: ${ticketRoleId ? `<@&${ticketRoleId}>` : '*Not set*'}`,
      `Session Ping: ${pingRoleId ? `<@&${pingRoleId}>` : '*Not set*'}`,
      '',
      '**Channels**',
      `Log Channel: ${logChannelId ? `<#${logChannelId}>` : '*Not set*'}`,
      `Ticket Category: ${ticketCategoryId ? `<#${ticketCategoryId}>` : '*Not set*'}`,
      '',
      '**Ranks** (lowest to highest)',
      ranks.length ? ranks.map((r) => `${r.level}. ${r.name}`).join(', ') : '*None configured yet, add one below.*',
      '',
      '**Infraction Types**',
      types.length ? types.map((t) => `${t.name} (${t.points} pts)`).join(', ') : '*None configured yet, add one below.*',
    ];

    const card = buildCard({
      accentColor: COLORS.blue,
      heading: `${icon('config')} Server Configuration`,
      lines,
    });

    const btn1 = new ButtonBuilder().setCustomId('cfg_roles').setLabel('Roles').setStyle(ButtonStyle.Primary);
    const btn2 = new ButtonBuilder().setCustomId('cfg_channels').setLabel('Channels').setStyle(ButtonStyle.Primary);
    const btn3 = new ButtonBuilder().setCustomId('cfg_ranks').setLabel('Ranks').setStyle(ButtonStyle.Secondary);
    const btn4 = new ButtonBuilder().setCustomId('cfg_infra').setLabel('Infractions').setStyle(ButtonStyle.Secondary);

    const row1 = new ActionRowBuilder().addComponents(btn1, btn2);
    const row2 = new ActionRowBuilder().addComponents(btn3, btn4);

    await interaction.reply({
      components: [card, row1, row2],
      ...V2,
      flags: V2.flags | MessageFlags.Ephemeral,
    });
  },
};
