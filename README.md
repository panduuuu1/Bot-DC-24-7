# Discord AFK 24/7 Bot

**A simple Discord bot that stays connected to your voice channel, with automatic reconnection and customizable activity.**

Bot Discord ringan yang dibuat buat kamu yang membutuhkan bot untuk tetap standby di voice channel tanpa harus terus-terusan join secara manual.

Dilengkapi sistem auto-reconnect, custom activity, dan beberapa slash commands untuk mempermudah pengelolaan bot langsung dari Discord.

## ✨ Features

- 🎧 **24/7 Voice Connection** — Keeps the bot connected to your configured voice channel.
- 🔄 **Auto-Reconnect System** — Automatically attempts to reconnect when the voice connection gets disconnected.
- 🎭 **Custom Activity** — Customize your bot's activity, including Playing, Listening, Watching, Competing, and Streaming.
- 💬 **Slash Commands** — Manage your bot directly through Discord.
- 🔇 **Self Mute & Deaf** — Configure whether the bot should join with self-mute or self-deaf enabled.
- ⚡ **Lightweight & Simple** — Easy to configure and run without unnecessary complexity.
- 🛠️ **PM2 Support** — Includes a PM2 ecosystem configuration for production and automatic process recovery.

## 🎮 Commands

| Command | Description |
|---|---|
| `/reload` | Restart the bot process. Requires PM2 or another process manager to start it again. |
| `/rejoin` | Force the bot to leave and rejoin the configured voice channel. |
| `/setactivity` | Change the bot's activity and custom text directly from Discord. |

All commands are configured with Administrator permissions. You can also restrict command access to specific bot owners using `OWNER_IDS`.

## 📋 Requirements

Before installing, make sure you have:

- [Node.js v20+](https://nodejs.org/)
- npm (included with Node.js)
- A Discord account
- A Discord Bot Application from the [Discord Developer Portal](https://discord.com/developers/applications)

## 🚀 Installation

**1. Clone the repository**

```bash
git clone https://github.com/panduuuu1/Bot-DC-24-7.git
cd Bot-DC-24-7
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the root directory.

Fill it with the following configuration:

```env
# Discord Configuration
DISCORD_TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_CLIENT_ID
GUILD_ID=YOUR_SERVER_ID
VOICE_CHANNEL_ID=YOUR_VOICE_CHANNEL_ID

# Owner Configuration (Optional)
OWNER_IDS=YOUR_DISCORD_USER_ID

# Voice Configuration
SELF_MUTE=false
SELF_DEAF=false

# Bot Activity
ACTIVITY_TYPE=LISTENING
ACTIVITY_TEXT=PANDU 24/7
STREAMING_URL=https://twitch.tv/discord
BOT_STATUS=online

# Custom Status (Optional)
CUSTOM_STATUS_TEXT=
```

**Configuration Guide:**

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your Discord bot token. |
| `CLIENT_ID` | Your Discord application ID. |
| `GUILD_ID` | The Discord server where commands will be registered. |
| `VOICE_CHANNEL_ID` | The voice channel the bot will automatically join. |
| `OWNER_IDS` | Optional Discord user IDs allowed to execute commands. Multiple IDs can be separated by commas. |
| `SELF_MUTE` | Set to `true` to make the bot join while muted. |
| `SELF_DEAF` | Set to `true` to make the bot join while deafened. |
| `ACTIVITY_TYPE` | Default bot activity type. |
| `ACTIVITY_TEXT` | Default activity text displayed by the bot. |
| `STREAMING_URL` | Streaming URL used when the activity type is `STREAMING`. |
| `BOT_STATUS` | Bot online status, such as `online`, `idle`, or `dnd`. |
| `CUSTOM_STATUS_TEXT` | Optional additional custom status text. |

**Available Activity Types:**

- `PLAYING`
- `LISTENING`
- `WATCHING`
- `COMPETING`
- `STREAMING`

**4. Deploy slash commands**

After configuring your `.env`, register the commands to your Discord server.

```bash
npm run deploy
```

**5. Start the bot**

```bash
npm start
```

If everything is configured correctly, the bot will log in to Discord and automatically connect to your configured voice channel.

## ⚙️ Running 24/7 with PM2

For production usage, this project already includes an `ecosystem.config.js` file with predefined PM2 settings.

PM2 helps keep the bot running in the background and automatically restarts the process if it crashes or exits.

**1. Install PM2 globally**

```bash
npm install -g pm2
```

**2. Start the bot using the ecosystem configuration**

```bash
pm2 start ecosystem.config.js
```

**3. Save the current process list**

```bash
pm2 save
```

**4. Enable startup on system reboot**

```bash
pm2 startup
```

Follow the command provided by PM2 in your terminal to complete the startup configuration.

### Useful PM2 Commands

| Command | Description |
|---|---|
| `pm2 status` | Check the bot's current status. |
| `pm2 logs afk-bot` | View bot logs. |
| `pm2 restart afk-bot` | Restart the bot manually. |
| `pm2 stop afk-bot` | Stop the bot. |
| `pm2 delete afk-bot` | Remove the bot from PM2. |
| `pm2 monit` | Monitor CPU and memory usage. |

## 📁 Project Structure

```text
Bot-DC-24-7/
│
├── commands/
│   ├── rejoin.js
│   ├── reload.js
│   └── setactivity.js
│
├── .gitignore
├── ecosystem.config.js
├── deploy-commands.js
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## 🔧 How It Works

The bot automatically connects to the voice channel specified in `VOICE_CHANNEL_ID` after successfully logging in to Discord.

When the voice connection gets disconnected, the auto-reconnect system attempts to restore the connection using an increasing retry delay.

The bot also monitors its own voice state to detect unexpected channel disconnections and attempts to reconnect when necessary.

The reconnect mechanism has a maximum of 5 consecutive attempts before stopping, so persistent connection issues may require manual intervention or a process restart.

## 🔒 Security Notes

- Never share your Discord bot token with anyone.
- Do not upload your `.env` file to GitHub.
- Keep your bot permissions limited to what it actually needs.
- Make sure your bot has permission to view, connect to, and access the configured voice channel.
- Use `OWNER_IDS` if you want to restrict commands to specific Discord users.

## 📌 Important Notes

- This bot requires a running host or server to stay online 24/7.
- PM2 manages the bot process but does not provide hosting.
- The `/reload` command exits the current process. Use PM2 to automatically start it again.
- Slash commands are registered specifically to the configured Discord server (`GUILD_ID`).

## 📄 License

Feel free to explore, use, and modify this project for your own needs.

---

<div align="center">

**Made with ❤️ by [panduuuu1](https://github.com/panduuuu1)**

*Keeping your Discord voice channel alive, 24/7.*

</div>
