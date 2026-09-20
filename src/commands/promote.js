const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { COLORS, icon } = require('../config');
const { getRanks, getScalar } = require('../utils/guildConfig');
const { canManageStaff } = require('../utils/permissions');
const { buildCard, V2 } = require('../utils/components');
const { addPromotion } = require('../db/database');
const { createError, logErrorToDiscord, ErrorCodes } = require('../utils/errorCodes');

function currentRank(member, ranks) {
  return ranks.find((r) => member.roles.cache.has(r.roleId)) || null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promote a staff member to a new rank')
    .addUserOption((opt) => opt.setName('user').setDescription('Staff member to promote').setRequired(true))
    .addStringOption((opt) =>
      opt.setName('rank').setDescription('Target rank').setRequired(true).setAutocomplete(true)
    )
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the promotion').setRequired(false)),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const ranks = await getRanks(interaction.guildId);
    const choices = ranks.filter((r) => r.name.toLowerCase().includes(focused)).slice(0, 25);
    await interaction.respond(choices.map((r) => ({ name: r.name, value: r.name })));
  },

  async execute(interaction) {
    try {
      if (!(await canManageStaff(interaction.member, interaction.guildId))) {
        const error = createError(ErrorCodes.AUTH_PERMISSION_DENIED, 'Staff management role required', null);
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'promote', guild_id: interaction.guildId }, interaction.client);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} Permission Denied`,
          lines: ["You don't have permission to promote staff members. This requires the **Staff Manage** role or the **Manage Roles** permission."],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      const ranks = await getRanks(interaction.guildId);
      if (!ranks.length) {
        const error = createError(ErrorCodes.CMD_INVALID_ARGS, 'No ranks configured', null);
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'promote', guild_id: interaction.guildId }, interaction.client);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} No Ranks Configured`,
          lines: ["This server doesn't have any ranks set up yet. Add one through **/config** before using this command."],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      const targetRankName = interaction.options.getString('rank', true);
      const rank = ranks.find((r) => r.name.toLowerCase() === targetRankName.toLowerCase());
      if (!rank) {
        const error = createError(ErrorCodes.CMD_INVALID_ARGS, `Rank not found: ${targetRankName}`, null);
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'promote', guild_id: interaction.guildId }, interaction.client);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} Rank Not Found`,
          lines: [`**"${targetRankName}"** isn't a configured rank.`, `\nAvailable ranks: ${ranks.map((r) => `**${r.name}**`).join(', ')}.`],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      const targetUser = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason');

      const member = await interaction.guild.members.fetch(targetUser.id).catch((err) => {
        console.error(`[promote] Failed to fetch member ${targetUser.id}: ${err.message}`);
        return null;
      });

      if (!member) {
        const error = createError(ErrorCodes.CMD_EXECUTION_FAILED, `User not found in guild: ${targetUser.id}`, null);
        await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'promote', guild_id: interaction.guildId }, interaction.client);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} User Not Found`,
          lines: ["That user isn't a member of this server."],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      const before = currentRank(member, ranks);
      const rankRoleIds = ranks.map((r) => r.roleId);

      await member.roles.remove(rankRoleIds.filter((id) => member.roles.cache.has(id))).catch((err) => {
        console.error(`[promote] Failed to remove previous rank roles: ${err.message}`);
      });
      await member.roles.add(rank.roleId).catch((err) => {
        console.error(`[promote] Failed to assign new rank role: ${err.message}`);
      });

      await addPromotion({
        guildId: interaction.guildId,
        userId: member.id,
        fromRank: before?.name || null,
        toRank: rank.name,
        issuedBy: interaction.user.id,
        reason,
      });

      const lines = [
        `${member} has been promoted to **${rank.name}**.`,
        before ? `Previous rank: **${before.name}**.` : `This is their first rank in the chain of command.`,
        reason ? `\n**Reason:** ${reason}` : `\nNo reason was given for this promotion.`,
        `\nPromoted by ${interaction.user} on <t:${Math.floor(Date.now() / 1000)}:f>. This is logged and will show up in their **/history**.`,
      ];

      const card = buildCard({
        accentColor: COLORS.yellow,
        heading: `${icon('promote')} Staff Promotion`,
        lines,
        thumbnailUrl: member.displayAvatarURL({ size: 256 }),
      });

      await interaction.reply({ components: [card], ...V2 });
      console.log(`[promote] ${interaction.user.tag} promoted ${member.user.tag} to ${rank.name}`);

      const logChannelId = await getScalar(interaction.guildId, 'logChannelId');
      if (logChannelId && logChannelId !== interaction.channelId) {
        const logChannel = await interaction.guild.channels.fetch(logChannelId).catch((err) => {
          console.error(`[promote] Failed to fetch log channel ${logChannelId}: ${err.message}`);
          return null;
        });
        if (logChannel?.isTextBased()) logChannel.send({ components: [card], ...V2 }).catch(() => {});
      }

      const dmCard = buildCard({
        accentColor: COLORS.yellow,
        heading: `${icon('promote')} You've Been Promoted`,
        lines: [
          `You have been promoted to **${rank.name}** in **${interaction.guild.name}**.`,
          before ? `You were previously **${before.name}**.` : `Welcome to the team.`,
          reason ? `\n**Reason:** ${reason}` : '',
          `\nCongratulations, and thank you for the work that earned this. If anything about your new rank or responsibilities is unclear, reach out to whoever promoted you or another member of staff.`,
        ].filter(Boolean),
      });
      const dmed = await member.send({ components: [dmCard], ...V2 }).catch(() => null);

      if (!dmed) {
        await interaction.followUp({
          content: `${icon('warning')} Couldn't send a DM to **${member.user.username}**. Their DMs may be closed, so make sure they hear about this some other way.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (err) {
      const error = createError(ErrorCodes.CMD_EXECUTION_FAILED, 'Failed to process promotion', err);
      await logErrorToDiscord(error, { user_id: interaction.user.id, command: 'promote', guild_id: interaction.guildId }, interaction.client);
      const reply = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
      await interaction[reply]({
        content: `${icon('error')} ${error.message}`,
        flags: MessageFlags.Ephemeral,
      }).catch(() => {});
    }
  },
};
