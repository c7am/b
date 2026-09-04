const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { COLORS, icon } = require('../config');
const { canManageStaff } = require('../utils/permissions');
const { buildCard, V2 } = require('../utils/components');
const { getUserHistory, getInfractionPoints } = require('../db/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('View promotion and infraction history for a staff member')
    .addUserOption((opt) => opt.setName('user').setDescription('Staff member').setRequired(true)),

  async execute(interaction) {
    if (!(await canManageStaff(interaction.member, interaction.guildId))) {
      console.error(`[history] ${interaction.user.tag} attempted to view history without permission`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Permission Denied`,
        lines: ["You don't have permission to view staff history. This requires the Staff Manage role or Manage Roles permission."],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    const targetUser = interaction.options.getUser('user', true);
    const [history, totalPoints] = await Promise.all([
      getUserHistory(interaction.guildId, targetUser.id),
      getInfractionPoints(interaction.guildId, targetUser.id),
    ]);

    const lines = [`**${targetUser.username}**: **${totalPoints}** active point${totalPoints === 1 ? '' : 's'}`, ''];

    const MAX_ENTRIES = 25; // keeps well clear of the 4000-char Components V2 text cap
    const shown = history.slice(0, MAX_ENTRIES);

    if (!history.length) {
      lines.push("No history found for this user.");
    } else {
      shown.forEach((entry) => {
        const ts = Math.floor(new Date(entry.created_at).getTime() / 1000);
        if (entry.kind === 'promotion') {
          const rankText = entry.to_rank ? `${entry.from_rank || 'none'} → **${entry.to_rank}**` : `${entry.from_rank} → removed`;
          lines.push(`<t:${ts}:d>: ${rankText}`);
          if (entry.reason) lines.push(`  Reason: ${entry.reason}`);
        } else if (entry.kind === 'infraction') {
          lines.push(`<t:${ts}:d>: **${entry.type}** (${entry.points} pts)`);
          lines.push(`  Reason: ${entry.reason}`);
        }
      });
      if (history.length > MAX_ENTRIES) {
        lines.push('', `-# Showing the ${MAX_ENTRIES} most recent of ${history.length} total entries.`);
      }
    }

    const card = buildCard({
      accentColor: COLORS.lavender,
      heading: `${icon('history')} Staff History`,
      lines,
    });

    await interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    console.log(`[history] ${interaction.user.tag} viewed history for ${targetUser.tag}`);
  },
};
