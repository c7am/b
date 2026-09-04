const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { COLORS, icon } = require('../config');
const { getRanks, getScalar } = require('../utils/guildConfig');
const { canManageStaff } = require('../utils/permissions');
const { buildCard, V2 } = require('../utils/components');
const { addPromotion } = require('../db/database');

function currentRank(member, ranks) {
  if (!ranks.length) return null;
  const userRanks = ranks.filter((r) => member.roles.cache.has(r.roleId));
  return userRanks.length ? userRanks.sort((a, b) => b.level - a.level)[0] : null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('demote')
    .setDescription('Demote a staff member to a lower rank')
    .addUserOption((opt) => opt.setName('user').setDescription('Staff member to demote').setRequired(true))
    .addStringOption((opt) =>
      opt.setName('new_rank').setDescription('Rank to demote them to').setRequired(true).setAutocomplete(true)
    )
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the demotion').setRequired(true))
    .addStringOption((opt) =>
      opt
        .setName('appealable')
        .setDescription('Can this demotion be appealed?')
        .setRequired(true)
        .addChoices(
          { name: 'Yes', value: 'yes' },
          { name: 'No', value: 'no' }
        )
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const ranks = await getRanks(interaction.guildId);
    const choices = ranks.filter((r) => r.name.toLowerCase().includes(focused)).slice(0, 25);
    await interaction.respond(choices.map((r) => ({ name: r.name, value: r.name })));
  },

  async execute(interaction) {
    if (!(await canManageStaff(interaction.member, interaction.guildId))) {
      console.error(`[demote] ${interaction.user.tag} attempted to demote without permission`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Permission Denied`,
        lines: ["You don't have permission to demote staff members. This requires the **Staff Manage** role or the **Manage Roles** permission."],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    const ranks = await getRanks(interaction.guildId);
    if (!ranks.length) {
      console.error(`[demote] No ranks configured in guild ${interaction.guildId}`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} No Ranks Configured`,
        lines: ["This server doesn't have any ranks set up yet. Add one through **/config** before using this command."],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    const targetUser = interaction.options.getUser('user', true);
    const newRankName = interaction.options.getString('new_rank', true);
    const reason = interaction.options.getString('reason', true);
    const appealable = interaction.options.getString('appealable', true) === 'yes';

    const newRank = ranks.find((r) => r.name.toLowerCase() === newRankName.toLowerCase());
    if (!newRank) {
      console.error(`[demote] Unknown rank requested: "${newRankName}"`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Rank Not Found`,
        lines: [`**"${newRankName}"** isn't a configured rank.`, `\nAvailable ranks: ${ranks.map((r) => `**${r.name}**`).join(', ')}.`],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    const member = await interaction.guild.members.fetch(targetUser.id).catch((err) => {
      console.error(`[demote] Failed to fetch member ${targetUser.id}: ${err.message}`);
      return null;
    });

    if (!member) {
      console.error(`[demote] Member not found in guild: ${targetUser.id}`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} User Not Found`,
        lines: ["That user isn't a member of this server."],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    const oldRank = currentRank(member, ranks);
    if (!oldRank) {
      console.error(`[demote] ${targetUser.tag} holds no rank to demote from`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} No Rank Held`,
        lines: [`${member} doesn't currently hold a rank, so there's nothing to demote.`],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    if (newRank.level >= oldRank.level) {
      console.error(`[demote] Rejected non-demotion: ${oldRank.name}(${oldRank.level}) -> ${newRank.name}(${newRank.level})`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Invalid Demotion`,
        lines: [
          `**${newRank.name}** is level **${newRank.level}**, but this user already holds **${oldRank.name}** (level ${oldRank.level}).`,
          "The new rank must be lower than their current one. Use **/promote** if you meant to move them up.",
        ],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    await member.roles.remove(oldRank.roleId).catch((err) => {
      console.error(`[demote] Failed to remove previous rank: ${err.message}`);
    });
    await member.roles.add(newRank.roleId).catch((err) => {
      console.error(`[demote] Failed to assign new rank: ${err.message}`);
    });

    await addPromotion({
      guildId: interaction.guildId,
      userId: member.id,
      fromRank: oldRank.name,
      toRank: newRank.name,
      issuedBy: interaction.user.id,
      reason,
    });

    const lines = [
      `${member} has been demoted.`,
      '',
      `Previous rank: **${oldRank.name}**`,
      `New rank: **${newRank.name}**`,
      `\n**Reason:** ${reason}`,
      appealable
        ? `\n**Appealable:** Yes, the member may raise this with staff if they'd like it reviewed.`
        : `\n**Appealable:** No, this decision is final and should not be reopened.`,
      `\nLogged by ${interaction.user} and recorded in ${member}'s **/history**.`,
    ];

    const card = buildCard({
      accentColor: COLORS.red,
      heading: `${icon('demote')} Staff Demotion`,
      lines,
      thumbnailUrl: member.displayAvatarURL({ size: 256 }),
    });

    await interaction.reply({ components: [card], ...V2 });
    console.log(`[demote] ${interaction.user.tag} demoted ${member.user.tag}: ${oldRank.name} -> ${newRank.name}`);

    const logChannelId = await getScalar(interaction.guildId, 'logChannelId');
    if (logChannelId && logChannelId !== interaction.channelId) {
      const logChannel = await interaction.guild.channels.fetch(logChannelId).catch((err) => {
        console.error(`[demote] Failed to fetch log channel ${logChannelId}: ${err.message}`);
        return null;
      });
      if (logChannel?.isTextBased()) logChannel.send({ components: [card], ...V2 }).catch(() => {});
    }

    const dmCard = buildCard({
      accentColor: COLORS.red,
      heading: `${icon('demote')} You've Been Demoted`,
      lines: [
        `You have been demoted in **${interaction.guild.name}**: **${oldRank.name}** → **${newRank.name}**.`,
        `\n**Reason:** ${reason}`,
        appealable
          ? `\nThis demotion **can be appealed.** Reach out to a member of staff if you'd like to discuss it.`
          : `\nThis demotion **cannot be appealed.** It's final.`,
      ],
    });
    const dmed = await member.send({ components: [dmCard], ...V2 }).catch(() => null);

    if (!dmed) {
      await interaction.followUp({
        content: `${icon('warning')} Couldn't send a DM to **${member.user.username}**. Their DMs may be closed, so make sure they hear about this some other way, especially the appeal status.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
