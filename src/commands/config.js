const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('View and manage the server configuration (use web dashboard instead)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guildId;

    const content = `Configuration has been moved to the web dashboard for better organization and usability!

**Access your settings at:**
Dashboard > Settings > [Scroll through sections]

**Or visit directly:**
https://isrp-staff-bot.onrender.com/dashboard/${guildId}

**Available in Settings:**
- Roles (Staff Manage, Ticket Staff, Session Ping)
- Channels (Log Channel, Ticket Category)
- Ranks (manage staff hierarchy)
- Infraction Types (custom violation presets)
- Ticket Categories (ticket panel setup)
- Shift Types (create custom shift types)
- Custom Violations (add custom violation types)
- ERLC Configuration (server API key)

All functionality is now centralized on the dashboard. This command will be removed in a future update.`;

    await interaction.reply({
      content,
      flags: MessageFlags.Ephemeral,
    });
  },
};
