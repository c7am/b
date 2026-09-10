const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { generateVerificationPhrase, storeVerificationCode } = require('../utils/robloxVerification');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('erlc-link')
    .setDescription('Link your Roblox username to your Discord account for ERLC shift syncing'),

  async execute(interaction) {
    const phrase = generateVerificationPhrase();
    await storeVerificationCode(interaction.user.id, interaction.guildId, phrase);

    const embed = new EmbedBuilder()
      .setTitle('Roblox Account Verification')
      .setDescription('To verify you own your Roblox account, follow these steps:')
      .addFields(
        {
          name: '1. Copy this phrase',
          value: `\`\`\`\n${phrase}\n\`\`\``,
          inline: false,
        },
        {
          name: '2. Put it in your Roblox bio',
          value: 'Visit https://www.roblox.com/my/settings/account and add the phrase to your bio. It can have other text too.',
          inline: false,
        },
        {
          name: '3. Click "Verify" when done',
          value: 'Once the phrase is in your Roblox bio, click the Verify button below.',
          inline: false,
        }
      )
      .setColor(0xcba6f7)
      .setFooter({ text: 'This phrase expires in 1 hour' });

    const verifyButton = new ButtonBuilder()
      .setCustomId(`erlc_verify_${interaction.user.id}`)
      .setLabel('Verify My Account')
      .setStyle(ButtonStyle.Primary);

    const regenerateButton = new ButtonBuilder()
      .setCustomId(`erlc_regenerate_${interaction.user.id}`)
      .setLabel('Regenerate Words')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔄');

    const row = new ActionRowBuilder().addComponents(verifyButton, regenerateButton);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
