const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { COLORS, icon } = require('../config');
const { buildCard, V2 } = require('../utils/components');
const { canManageStaff } = require('../utils/permissions');
const { getCurrentPlayers } = require('../handlers/erlcHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('erlc-players')
    .setDescription('View current players on the ERLC server'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!canManageStaff(interaction.member, interaction.guild)) {
      return interaction.editReply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const result = await getCurrentPlayers(interaction.guildId);
    if (result.error) {
      return interaction.editReply({
        content: `Failed to fetch ERLC players: ${result.error}. Make sure ERLC API is configured in settings.`,
        ephemeral: true,
      });
    }

    const players = result.players || [];
    if (players.length === 0) {
      return interaction.editReply({
        content: 'No players currently on the ERLC server.',
        ephemeral: true,
      });
    }

    // Build player list
    const playerLines = players
      .slice(0, 20) // Limit to 20 for embed size
      .map((p) => `**${p.username || p.name}** - Team: ${p.team || 'Civilian'}`)
      .join('\n');

    const card = buildCard({
      accentColor: COLORS.mauve,
      heading: `${icon('users')} ERLC Players (${players.length})`,
      lines: [playerLines || 'No players'],
    });

    return interaction.editReply({ ...V2, components: [card] });
  },
};
