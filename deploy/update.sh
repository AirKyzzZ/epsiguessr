#!/bin/bash
# Auto-deploy script for EPSIGuessr Discord Bot
# Pulls latest changes from main branch and restarts if needed

set -e

BOT_DIR="/home/samsepiol/geoguessr-npmz-discord-bot"
SERVICE_NAME="geoguessr-bot"

cd "$BOT_DIR"

# Fetch latest changes
git fetch origin main --quiet

# Check if there are new commits
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "[$(date)] New commits detected, updating..."

# Pull changes
git pull origin main --quiet

# Install dependencies (in case they changed)
npm install --production --quiet

# Build TypeScript
npm run build

# Restart the bot
sudo systemctl restart "$SERVICE_NAME"

echo "[$(date)] Bot updated and restarted successfully."
