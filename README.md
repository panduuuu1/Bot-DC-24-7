# Discord AFK 24/7 Bot

Bot Discord ringan yang didesain untuk tetap berada di voice channel 24 jam non-stop (AFK) dengan sistem auto-reconnect cerdas.

## Fitur
- ✅ AFK 24/7 di Voice Channel
- ✅ Auto-Reconnect jika koneksi terputus
- ✅ Custom Activity (Listening/Streaming/Watching)
- ✅ Slash Commands (`/reload`, `/rejoin`, `/setactivity`)
- ✅ Support Node.js v20+

## Persyaratan
- Node.js v20 atau lebih baru
- FFmpeg (opsional, jika ingin menambahkan fitur musik)

## Cara Install
1. Clone repository ini:
   ```bash
   git clone https://github.com/USERNAME/NAMA-REPO.git
   cd NAMA-REPO
2. Install dependencies:

bash
npm install
3. Buat file .env dan isi konfigurasinya (lihat .env.example).

4. Deploy slash commands:

bash
node deploy-commands.js
5. Jalankan bot:

bash
node index.js
Cara Menjalankan 24/7 (Production)
Gunakan PM2:

bash
npm install -g pm2
pm2 start index.js --name "afk-bot"
pm2 save
pm2 startup
Dibuat untuk kebutuhan AFK 24/7 tanpa ribet.

text

Lalu commit lagi:
```bash
