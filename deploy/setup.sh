#!/bin/bash
# One-time setup script for the home server
# Run this once after cloning the repo on your server

set -e

echo "=== EPSIGuessr Bot — Home Server Setup ==="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Install it first: https://nodejs.org/"
  exit 1
fi

echo "Node.js version: $(node --version)"

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Check .env exists
if [ ! -f .env ]; then
  echo ""
  echo "⚠️  No .env file found!"
  echo "Copy .env.example to .env and fill in your tokens:"
  echo "  cp .env.example .env"
  echo "  nano .env"
  echo ""
  exit 1
fi

# Install systemd service
echo ""
echo "Installing systemd service..."
sudo cp deploy/geoguessr-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable geoguessr-bot

echo ""
echo "Starting the bot..."
sudo systemctl start geoguessr-bot

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Useful commands:"
echo "  sudo systemctl status geoguessr-bot   # Check status"
echo "  journalctl -u geoguessr-bot -f         # View logs"
echo "  sudo systemctl restart geoguessr-bot   # Restart"
echo ""
echo "For auto-deploy on push, add to crontab:"
echo "  crontab -e"
echo "  */5 * * * * $(pwd)/deploy/update.sh >> /var/log/geoguessr-deploy.log 2>&1"
