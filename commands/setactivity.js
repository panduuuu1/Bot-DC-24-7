const { SlashCommandBuilder, PermissionFlagsBits, ActivityType } = require('discord.js');
const OWNER_IDS = (process.env.OWNER_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setactivity')
    .setDescription('Ganti activity bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('tipe').setDescription('Tipe').setRequired(true)
      .addChoices(
        { name: 'Playing', value: 'PLAYING' }, { name: 'Listening', value: 'LISTENING' },
        { name: 'Watching', value: 'WATCHING' }, { name: 'Competing', value: 'COMPETING' }
      ))
    .addStringOption(opt => opt.setName('text').setDescription('Teks').setRequired(true)),
  async execute(interaction) {
    if (OWNER_IDS.length > 0 && !OWNER_IDS.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ Hanya owner bot.', ephemeral: true });
    }
    const tipe = interaction.options.getString('tipe');
    const text = interaction.options.getString('text');
    const typeMap = { PLAYING: ActivityType.Playing, LISTENING: ActivityType.Listening, WATCHING: ActivityType.Watching, COMPETING: ActivityType.Competing };
    
    interaction.client.user.setPresence({
      status: process.env.BOT_STATUS || 'online',
      activities: [{ name: text, type: typeMap[tipe] }],
    });
    await interaction.reply({ content: `✅ Activity: **${tipe}** → \`${text}\``, ephemeral: true });
  },
};
