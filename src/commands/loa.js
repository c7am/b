const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { COLORS, icon } = require('../config');
const { canManageStaff } = require('../utils/permissions');
const { buildCard, V2 } = require('../utils/components');
const { startLoa, getActiveLoa, endLoa, getActiveLoas } = require('../db/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loa')
    .setDescription('Manage staff leave of absence')
    .addSubcommand((sub) =>
      sub
        .setName('start')
        .setDescription('Begin a leave of absence')
        .addUserOption((opt) => opt.setName('user').setDescription('Staff member').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for LOA').setRequired(true))
        .addStringOption((opt) =>
          opt
            .setName('until')
            .setDescription('Return date (YYYY-MM-DD format)')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('end')
        .setDescription('End an active leave of absence')
        .addUserOption((opt) => opt.setName('user').setDescription('Staff member').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('List all active leaves of absence in this server')
    ),

  async execute(interaction) {
    if (!(await canManageStaff(interaction.member, interaction.guildId))) {
      console.error(`[loa] ${interaction.user.tag} attempted LOA operation without permission`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Permission Denied`,
        lines: ["You don't have permission to manage staff leave. This requires the **Staff Manage** role or the **Manage Roles** permission."],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    if (subcommand === 'start') {
      const user = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason', true);
      const until = interaction.options.getString('until', true);

      const existing = await getActiveLoa(guildId, user.id);
      if (existing) {
        console.error(`[loa] ${interaction.user.tag} attempted to start LOA for ${user.tag} who already has one active`);
        const endsTs = Math.floor(new Date(`${existing.ends_at}T00:00:00Z`).getTime() / 1000);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} Already on Leave`,
          lines: [
            `${user} already has an active leave of absence, so a new one can't be started on top of it.`,
            `\n**Returning:** <t:${endsTs}:D>`,
            `**Reason:** ${existing.reason}`,
            `\nUse **/loa end** first if you need to change the details.`,
          ],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) {
        console.error(`[loa] Invalid date format provided: "${until}"`);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} Invalid Date Format`,
          lines: ['Please use **YYYY-MM-DD** format (e.g., `2026-09-15`).'],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      // The regex only checks the shape. "2026-02-30" matches it but isn't a
      // real day (JS silently rolls it into March 2nd instead of erroring),
      // so re-check the parsed date's components against what was typed.
      const [untilYear, untilMonth, untilDay] = until.split('-').map(Number);
      const untilDate = new Date(`${until}T00:00:00Z`);
      const isRealDate =
        !isNaN(untilDate.getTime()) &&
        untilDate.getUTCFullYear() === untilYear &&
        untilDate.getUTCMonth() === untilMonth - 1 &&
        untilDate.getUTCDate() === untilDay;

      if (!isRealDate) {
        console.error(`[loa] Not a real calendar date: "${until}"`);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} Invalid Date`,
          lines: [`**"${until}"** isn't a real calendar date. Double-check the month and day.`],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (untilDate < today) {
        console.error(`[loa] Return date is in the past: "${until}"`);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} Date Already Passed`,
          lines: [`**${until}** is in the past. The return date needs to be today or later.`],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      await startLoa({ guildId, userId: user.id, reason, endsAt: until });

      const returnTs = Math.floor(untilDate.getTime() / 1000);
      const card = buildCard({
        accentColor: COLORS.sky,
        heading: `${icon('loa')} Leave of Absence Started`,
        lines: [
          `${user} is now on an approved leave of absence.`,
          `\n**Reason:** ${reason}`,
          `**Returning:** <t:${returnTs}:D> (<t:${returnTs}:R>)`,
          `\nThis is tracked automatically, so there's nothing further to do until they're back. Run **/loa end** then to close it out.`,
        ],
        thumbnailUrl: user.displayAvatarURL({ size: 256 }),
      });

      await interaction.reply({ components: [card], ...V2 });
      console.log(`[loa] ${interaction.user.tag} started LOA for ${user.tag} until ${until}`);
    } else if (subcommand === 'end') {
      const user = interaction.options.getUser('user', true);

      const existing = await getActiveLoa(guildId, user.id);
      if (!existing) {
        console.error(`[loa] ${interaction.user.tag} attempted to end LOA for ${user.tag} who has none active`);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} No Active Leave`,
          lines: [`${user} is not currently on a leave of absence, so there's nothing to end.`],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      const ended = await endLoa(guildId, user.id);
      if (!ended) {
        console.error(`[loa] Failed to end LOA for ${user.id}`);
        const card = buildCard({
          accentColor: COLORS.red,
          heading: `${icon('error')} Something Went Wrong`,
          lines: ['Failed to end the leave of absence. Check the console for details.'],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      const card = buildCard({
        accentColor: COLORS.green,
        heading: `${icon('success')} Leave of Absence Ended`,
        lines: [
          `${user} is no longer on leave of absence and is expected back on active duty.`,
          `\n**Was on leave since:** <t:${Math.floor(new Date(existing.starts_at).getTime() / 1000)}:D>`,
          `**Was scheduled to return:** <t:${Math.floor(new Date(`${existing.ends_at}T00:00:00Z`).getTime() / 1000)}:D>`,
          `\nClosed out by ${interaction.user}.`,
        ],
        thumbnailUrl: user.displayAvatarURL({ size: 256 }),
      });

      await interaction.reply({ components: [card], ...V2 });
      console.log(`[loa] ${interaction.user.tag} ended LOA for ${user.tag}`);
    } else if (subcommand === 'list') {
      const allLoas = await getActiveLoas(guildId);

      if (!allLoas.length) {
        const card = buildCard({
          accentColor: COLORS.blue,
          heading: `${icon('loa')} Active Leaves of Absence`,
          lines: ['No staff members are currently on leave. Everyone is active.'],
        });
        return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      }

      const lines = [`**${allLoas.length}** staff member${allLoas.length === 1 ? ' is' : 's are'} currently on leave in this server:`, ''];
      for (const loa of allLoas) {
        const endsTs = Math.floor(new Date(`${loa.ends_at}T00:00:00Z`).getTime() / 1000);
        lines.push(`<@${loa.user_id}>: returning <t:${endsTs}:D> (<t:${endsTs}:R>)`);
        lines.push(`  **Reason:** ${loa.reason}`);
      }

      const card = buildCard({
        accentColor: COLORS.sky,
        heading: `${icon('loa')} Active Leaves of Absence`,
        lines,
      });

      await interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
      console.log(`[loa] ${interaction.user.tag} listed ${allLoas.length} active LOAs`);
    }
  },
};
