const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { COLORS, icon } = require('../config');
const { getInfractionTypes, getScalar } = require('../utils/guildConfig');
const { canManageStaff } = require('../utils/permissions');
const { buildCard, V2 } = require('../utils/components');
const { addInfraction, getInfractionPoints } = require('../db/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infract')
    .setDescription('Issue an infraction to a staff member')
    .addUserOption((opt) => opt.setName('user').setDescription('Staff member to infract').setRequired(true))
    .addStringOption((opt) =>
      opt.setName('type').setDescription('Infraction type').setRequired(true).setAutocomplete(true)
    )
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for the infraction').setRequired(true)),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const types = await getInfractionTypes(interaction.guildId);
    const choices = types.filter((t) => t.name.toLowerCase().includes(focused)).slice(0, 25);
    await interaction.respond(choices.map((t) => ({ name: `${t.name} (${t.points} pts)`, value: t.name })));
  },

  async execute(interaction) {
    if (!(await canManageStaff(interaction.member, interaction.guildId))) {
      console.error(`[infract] ${interaction.user.tag} attempted to infract without permission`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Permission Denied`,
        lines: ["You don't have permission to issue infractions. This requires the **Staff Manage** role or the **Manage Roles** permission."],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    const types = await getInfractionTypes(interaction.guildId);
    if (!types.length) {
      console.error(`[infract] No infraction types configured in guild ${interaction.guildId}`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} No Infraction Types Configured`,
        lines: ["This server doesn't have any infraction types set up yet. Add one through **/config** before using this command."],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    const typeName = interaction.options.getString('type', true);
    const type = types.find((t) => t.name.toLowerCase() === typeName.toLowerCase());
    if (!type) {
      console.error(`[infract] Unknown type requested: "${typeName}"`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} Type Not Found`,
        lines: [`**"${typeName}"** isn't a configured infraction type.`, `\nAvailable types: ${types.map((t) => `**${t.name}**`).join(', ')}.`],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    const member = await interaction.guild.members.fetch(targetUser.id).catch((err) => {
      console.error(`[infract] Failed to fetch member ${targetUser.id}: ${err.message}`);
      return null;
    });

    if (!member) {
      console.error(`[infract] Member not found in guild: ${targetUser.id}`);
      const card = buildCard({
        accentColor: COLORS.red,
        heading: `${icon('error')} User Not Found`,
        lines: ["That user isn't a member of this server."],
      });
      return interaction.reply({ components: [card], ...V2, flags: V2.flags | MessageFlags.Ephemeral });
    }

    // Order matters: must await the insert before reading the sum back,
    // or the SELECT can race the INSERT over the network and undercount.
    await addInfraction({
      guildId: interaction.guildId,
      userId: member.id,
      type: type.name,
      points: type.points,
      issuedBy: interaction.user.id,
      reason,
    });
    const totalPoints = await getInfractionPoints(interaction.guildId, member.id);

    const card = buildCard({
      accentColor: COLORS.red,
      heading: `${icon('infract')} Infraction Issued`,
      lines: [
        `${member} has received a **${type.name}** infraction (**${type.points}** point${type.points === 1 ? '' : 's'}).`,
        `\n**Reason:** ${reason}`,
        `\n**Total active points:** ${totalPoints}`,
        `\nIssued by ${interaction.user}. This is logged and will show up in **/history**.`,
      ],
      thumbnailUrl: member.displayAvatarURL({ size: 256 }),
    });

    await interaction.reply({ components: [card], ...V2 });
    console.log(`[infract] ${interaction.user.tag} issued ${type.name} to ${member.user.tag}, total now ${totalPoints}pts`);

    const logChannelId = await getScalar(interaction.guildId, 'logChannelId');
    if (logChannelId && logChannelId !== interaction.channelId) {
      const logChannel = await interaction.guild.channels.fetch(logChannelId).catch((err) => {
        console.error(`[infract] Failed to fetch log channel ${logChannelId}: ${err.message}`);
        return null;
      });
      if (logChannel?.isTextBased()) logChannel.send({ components: [card], ...V2 }).catch(() => {});
    }

    const dmCard = buildCard({
      accentColor: COLORS.red,
      heading: `${icon('infract')} You've Received an Infraction`,
      lines: [
        `You have received an infraction in **${interaction.guild.name}**: **${type.name}** (**${type.points}** point${type.points === 1 ? '' : 's'}).`,
        `\n**Reason:** ${reason}`,
        `\n**Your total active points:** ${totalPoints}`,
        `\nIf you think this was issued in error, reach out to a member of staff to discuss it.`,
      ],
    });
    const dmed = await member.send({ components: [dmCard], ...V2 }).catch(() => null);

    if (!dmed) {
      await interaction.followUp({
        content: `${icon('warning')} Couldn't send a DM to **${member.user.username}**. Their DMs may be closed, so make sure they hear about this some other way.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
