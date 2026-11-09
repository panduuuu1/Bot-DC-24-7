require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  ActivityType,
} = require('discord.js');
const {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection,
} = require('@discordjs/voice');

// ====== Filter noise ETIMEDOUT ======
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args.map((a) => (typeof a === 'string' ? a : '')).join(' ');
  if (msg.includes('ETIMEDOUT') && (msg.includes(':2053') || msg.includes(':2083') || msg.includes(':2087') || msg.includes(':2096'))) {
    return;
  }
  originalConsoleError(...args);
};

// ====== Validasi ENV ======
const REQUIRED_ENV = ['DISCORD_TOKEN', 'GUILD_ID', 'VOICE_CHANNEL_ID'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ ENV belum diisi: ${missing.join(', ')}`);
  process.exit(1);
}

const SELF_MUTE = process.env.SELF_MUTE === 'true';
const SELF_DEAF = process.env.SELF_DEAF === 'true';
const TARGET_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

// ====== Activity Config ======
const ACTIVITY_TYPE_MAP = {
  PLAYING: ActivityType.Playing,
  LISTENING: ActivityType.Listening,
  WATCHING: ActivityType.Watching,
  COMPETING: ActivityType.Competing,
  STREAMING: ActivityType.Streaming,
};

const ACTIVITY_TYPE = ACTIVITY_TYPE_MAP[process.env.ACTIVITY_TYPE?.toUpperCase()] ?? ActivityType.Listening;
const ACTIVITY_TEXT = process.env.ACTIVITY_TEXT || 'PANDU 24/7';
const STREAMING_URL = process.env.STREAMING_URL || 'https://twitch.tv/discord';
const BOT_STATUS = process.env.BOT_STATUS || 'online';
const CUSTOM_STATUS_TEXT = process.env.CUSTOM_STATUS_TEXT || '';

// ====== Discord Client ======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
  rest: {
    timeout: 30_000,
    retries: 5,
  },
});

client.commands = new Collection();

// ====== Load Commands ======
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`📦 Command dimuat: ${command.data.name}`);
    }
  }
}

// ====== Fungsi Set Activity ======
function setBotActivity(text = ACTIVITY_TEXT, type = ACTIVITY_TYPE) {
  const activity = { name: text, type };
  if (type === ActivityType.Streaming) activity.url = STREAMING_URL;

  const activities = [activity];
  if (CUSTOM_STATUS_TEXT) {
    activities.push({
      name: 'Custom Status',
      type: ActivityType.Custom,
      state: CUSTOM_STATUS_TEXT,
    });
  }

  client.user.setPresence({
    status: BOT_STATUS,
    activities,
  });
  console.log(`🎭 Activity: ${text}`);
}

// ====== Retry State ======
const retryState = new Map();
const connectingGuilds = new Set();
const internalVoiceOps = new Set();
const MAX_RETRY = 5;
const BASE_DELAY = 5_000;

function scheduleReconnect(guild) {
  const state = retryState.get(guild.id) || { count: 0, timeout: null, inProgress: false };

  if (state.inProgress) return;
  if (state.count >= MAX_RETRY) {
    console.error(`❌ [${guild.name}] Gagal reconnect ${MAX_RETRY}x.`);
    return;
  }

  if (state.timeout) clearTimeout(state.timeout);

  const delay = Math.min(BASE_DELAY * Math.pow(2, state.count), 5 * 60_000);
  state.count++;
  state.inProgress = true;

  console.log(`⏳ [${guild.name}] Reconnect attempt #${state.count} dalam ${delay / 1000}s...`);

  state.timeout = setTimeout(async () => {
    if (!client.isReady() || !client.guilds.cache.has(guild.id)) {
      state.inProgress = false;
      retryState.set(guild.id, state);
      return;
    }

    try {
      await connectToVoice(guild);
      retryState.delete(guild.id);
      console.log(`✅ [${guild.name}] Reconnect berhasil.`);
    } catch (err) {
      state.inProgress = false;
      retryState.set(guild.id, state);
      scheduleReconnect(guild);
    }
  }, delay);

  retryState.set(guild.id, state);
}

function resetRetry(guildId) {
  const state = retryState.get(guildId);
  if (state?.timeout) clearTimeout(state.timeout);
  retryState.delete(guildId);
}

// ====== Fungsi Join Voice ======
async function connectToVoice(guild) {
  if (connectingGuilds.has(guild.id)) return null;

  connectingGuilds.add(guild.id);
  internalVoiceOps.add(guild.id);

  try {
    const channel = guild.channels.cache.get(TARGET_CHANNEL_ID);
    if (!channel || !channel.isVoiceBased()) return null;

    const oldConn = getVoiceConnection(guild.id);
    if (oldConn) {
      try { oldConn.destroy(); } catch {}
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: SELF_MUTE,
      selfDeaf: SELF_DEAF,
    });

    connection.on('error', (err) => {
      console.warn('⚠️  Voice connection error (handled):', err.message);
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(`✅ Tersambung ke voice: ${channel.name}`);
      resetRetry(guild.id);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        try { connection.destroy(); } catch {}
        scheduleReconnect(guild);
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      scheduleReconnect(guild);
    });

    return connection;
  } catch (err) {
    scheduleReconnect(guild);
    return null;
  } finally {
    connectingGuilds.delete(guild.id);
    setTimeout(() => internalVoiceOps.delete(guild.id), 2000);
  }
}

client.connectToVoice = connectToVoice;
client.resetRetry = resetRetry;

// ====== Event: Ready ======
client.once(Events.ClientReady, async () => {
  console.log(`🤖 Login sebagai ${client.user.tag}`);
  setBotActivity();

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) {
    console.error(`❌ Guild ${process.env.GUILD_ID} tidak ditemukan.`);
    return;
  }
  await connectToVoice(guild);
});

// ====== Event: VoiceStateUpdate ======
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (newState.id !== client.user.id) return;
  const guild = newState.guild;

  if (internalVoiceOps.has(guild.id)) return;
  if (newState.channelId === TARGET_CHANNEL_ID) return;

  if (oldState.channelId !== newState.channelId) {
    scheduleReconnect(guild);
  }
});

// ====== Event: InteractionCreate ======
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error di /${interaction.commandName}:`, error);
    const msg = { content: '❌ Terjadi error.', flags: 64 };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg).catch(() => {});
    } else {
      await interaction.reply(msg).catch(() => {});
    }
  }
});

// ====== Global Error Handler ======
process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught exception (handled):', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled rejection (handled):', reason?.message || reason);
});

// ====== Graceful Shutdown ======
async function shutdown(signal) {
  console.log(`\n🛑 Menerima ${signal}, mematikan bot...`);
  for (const guild of client.guilds.cache.values()) {
    const conn = getVoiceConnection(guild.id);
    if (conn) {
      try { conn.destroy(); } catch {}
    }
  }
  client.destroy();
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ====== Login ======
client.login(process.env.DISCORD_TOKEN);
