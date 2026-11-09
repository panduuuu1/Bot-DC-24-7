const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const OWNER_IDS = (process.env.OWNER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rejoin')
    .setDescription('Paksa bot keluar & join ulang ke voice channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    if (OWNER_IDS.length > 0 && !OWNER_IDS.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ Hanya owner bot.', ephemeral: true });
    }
    await interaction.reply({ content: '🔄 Rejoin voice...', ephemeral: true });
    const oldConn = getVoiceConnection(interaction.guild.id);
    if (oldConn) { try { oldConn.destroy(); } catch {} }
    if (typeof interaction.client.connectToVoice === 'function') {
      await interaction.client.connectToVoice(interaction.guild);
    }
  },
};
