const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const OWNER_IDS = (process.env.OWNER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Restart bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    if (OWNER_IDS.length > 0 && !OWNER_IDS.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ Hanya owner bot.', ephemeral: true });
    }
    await interaction.reply({ content: '🔄 Merestart bot...', ephemeral: true });
    setTimeout(() => process.exit(0), 1500);
  },
};
