# 🌍 EPSIGuessr — Discord GeoGuessr Bot

A Discord bot that drops you into a random street view from anywhere in the world. Guess the country, compete with friends, climb the leaderboard.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![Mapillary](https://img.shields.io/badge/Mapillary-05CB63?logo=mapillary&logoColor=white)

<p align="center">
  <img src="https://i.imgur.com/placeholder.png" alt="EPSIGuessr Demo" width="400">
</p>

---

## How It Works

1. Someone types `/geo`
2. The bot fetches a random street-level image from [Mapillary](https://www.mapillary.com/)
3. Everyone in the channel guesses which country it is
4. **3 tries per player** — typos are forgiven, aliases work (USA, UK, Holland...)
5. Use `/hint` if you're stuck — it reveals the continent, then the first letter, then the word length
6. First to guess correctly wins. If everyone fails, the answer is revealed automatically

## Commands

| Command | Description |
|---------|-------------|
| `/geo` | Start a new round |
| `/hint` | Get a progressive hint (continent → first letter → letter count) |
| `/skip` | Skip the round and reveal the answer |
| `/leaderboard` | Top 10 players by wins |
| `/stats` | Your stats or another player's |
| `/lang` | Switch language (English / French) |
| `/help` | How to play |

## Features

- **Fuzzy matching** — "Frnace" → France, "espana" → Spain, "uk" → United Kingdom
- **Multiplayer** — Multiple players guess simultaneously, answer only revealed when all are out of tries
- **Leaderboard** — SQLite-backed persistent stats with win streaks
- **Bilingual** — Full English and French support, persisted per server
- **Hint system** — 3 progressive hints per round
- **Crash-resistant** — All API calls wrapped with timeouts and error handling

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | TypeScript + Node.js |
| Discord | discord.js v14 |
| Street imagery | [Mapillary API v4](https://www.mapillary.com/developer) (free) |
| Geocoding | [Nominatim / OpenStreetMap](https://nominatim.openstreetmap.org/) (free) |
| Database | SQLite via better-sqlite3 |
| Fuzzy matching | Fuse.js |

## Setup

### Prerequisites

- Node.js 18+
- A [Discord bot application](https://discord.com/developers/applications) with **Message Content Intent** enabled
- A [Mapillary API token](https://www.mapillary.com/developer) (free)

### Installation

```bash
git clone https://github.com/your-username/geoguessr-npmz-discord-bot.git
cd geoguessr-npmz-discord-bot
npm install
```

### Configuration

Copy the example env file and fill in your tokens:

```bash
cp .env.example .env
```

```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_id
MAPILLARY_TOKEN=your_mapillary_client_access_token
```

### Run

```bash
# Development (with hot reload via tsx)
npm run dev

# Production
npm run build
npm start
```

### Invite the Bot

Replace `YOUR_CLIENT_ID` with your Discord application ID:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=277025508352&scope=bot%20applications.commands
```

## Self-Hosting (24/7)

### Using systemd (Linux)

```bash
# Copy the service file
sudo cp deploy/geoguessr-bot.service /etc/systemd/system/

# Edit the service file with your paths and user
sudo nano /etc/systemd/system/geoguessr-bot.service

# Enable and start
sudo systemctl enable geoguessr-bot
sudo systemctl start geoguessr-bot

# Check status
sudo systemctl status geoguessr-bot

# View logs
journalctl -u geoguessr-bot -f
```

### Auto-Deploy on Push

The included `deploy/update.sh` script pulls the latest code and restarts the bot:

```bash
# Set up a cron job to check for updates every 5 minutes
crontab -e
# Add: */5 * * * * /path/to/geoguessr-npmz-discord-bot/deploy/update.sh
```

Or use a GitHub webhook for instant deploys.

## Project Structure

```
src/
├── commands/        # Slash command handlers
│   ├── geo.ts       # /geo — start a round
│   ├── hint.ts      # /hint — progressive hints
│   ├── skip.ts      # /skip — skip round
│   ├── leaderboard.ts
│   ├── stats.ts
│   ├── help.ts
│   └── lang.ts      # /lang — switch language
├── services/        # External API clients
│   ├── mapillary.ts # Street view image fetching
│   ├── geocoding.ts # Reverse geocoding (Nominatim)
│   ├── location.ts  # Random coordinate generation
│   └── leaderboard.ts # SQLite persistence
├── game/            # Game state management
│   ├── session.ts   # Round state & player tracking
│   ├── manager.ts   # Active sessions per channel
│   └── matcher.ts   # Fuzzy country name matching
├── data/
│   ├── countries.ts # 130+ countries with bboxes, flags, aliases
│   └── continents.ts # Country → continent mapping
├── i18n.ts          # English & French translations
├── config.ts        # Environment variable loading
└── index.ts         # Bot entry point & message handler
```

## Credits

- Street-level imagery by [Mapillary](https://www.mapillary.com/) (Meta)
- Geocoding by [OpenStreetMap / Nominatim](https://nominatim.openstreetmap.org/)
- Inspired by [GeoGuessr](https://www.geoguessr.com/)

## License

MIT — do whatever you want with it.

---

*Built by [Maxime Mansiet](https://maximemansiet.fr) as a fun side project.*
