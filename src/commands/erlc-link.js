const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('erlc-link')
    .setDescription('Link your Roblox username to your Discord account for ERLC shift syncing'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId(`erlc_link_modal_${interaction.user.id}`)
      .setTitle('Link Roblox Account');

    const usernameInput = new TextInputBuilder()
      .setCustomId('roblox_username')
      .setLabel('Roblox Username')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('e.g. YourRobloxUsername');

    const row = new ActionRowBuilder().addComponents(usernameInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  },
};
