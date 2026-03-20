import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
  REST,
  Routes,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { config } from "./config";
import { getSession, endSession } from "./game/manager";
import { getPlayerTriesLeft, recordTry, allPlayersExhausted } from "./game/session";
import { matchCountry } from "./game/matcher";
import { recordWin, recordLoss } from "./services/leaderboard";
import { getLang } from "./i18n";
import { startPool } from "./services/location-pool";

// Import commands
import * as geoCommand from "./commands/geo";
import * as leaderboardCommand from "./commands/leaderboard";
import * as statsCommand from "./commands/stats";
import * as skipCommand from "./commands/skip";
import * as hintCommand from "./commands/hint";
import * as helpCommand from "./commands/help";
import * as langCommand from "./commands/lang";

type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const commands = new Collection<string, Command>();
commands.set(geoCommand.data.name, geoCommand as Command);
commands.set(leaderboardCommand.data.name, leaderboardCommand as Command);
commands.set(statsCommand.data.name, statsCommand as Command);
commands.set(skipCommand.data.name, skipCommand as Command);
commands.set(hintCommand.data.name, hintCommand as Command);
commands.set(helpCommand.data.name, helpCommand as Command);
commands.set(langCommand.data.name, langCommand as Command);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Prevent unhandled errors from crashing the bot
client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

// Filter out non-guess messages
const NON_GUESS_PATTERN = /^(<@[!&]?\d+>|https?:\/\/|<#\d+>|<a?:\w+:\d+>)/;

function isLikelyGuess(text: string): boolean {
  if (text.length < 2 || text.length > 60) return false;
  if (text.startsWith("/") || text.startsWith("!")) return false;
  if (NON_GUESS_PATTERN.test(text)) return false;
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(text)) return false;
  return true;
}

// Register slash commands on startup
async function registerCommands(): Promise<void> {
  const rest = new REST().setToken(config.discordToken);
  const commandData = [...commands.values()].map((c) => c.data.toJSON());

  console.log(`Registering ${commandData.length} slash commands...`);
  await rest.put(Routes.applicationCommands(config.discordClientId), {
    body: commandData,
  });
  console.log("Slash commands registered.");
}

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing /${interaction.commandName}:`, error);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Something went wrong. Try again!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "Something went wrong. Try again!",
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (followUpError) {
      console.error("Failed to send error feedback:", followUpError);
    }
  }
});

// Handle guesses via regular messages
client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.author.bot) return;

    const session = getSession(message.channelId);
    if (!session) return;

    const guess = message.content.trim();
    if (!isLikelyGuess(guess)) return;

    const t = getLang(message.guildId);
    const userId = message.author.id;
    const username = message.author.username;

    const triesLeft = getPlayerTriesLeft(session, userId);
    if (triesLeft <= 0) return;

    const isCorrect = matchCountry(guess, session.answer);

    if (isCorrect) {
      session.winnerId = userId;
      endSession(message.channelId);

      recordWin(userId, username);

      // Record loss for all other participants (using stored usernames)
      for (const [playerId, entry] of session.playerTries) {
        if (playerId !== userId) {
          recordLoss(playerId, entry.username);
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(t.guess.correct)
        .setDescription(t.guess.correctDesc(username, session.answerFlag, session.answer))
        .setFooter({
          text: `📍 https://www.openstreetmap.org/#map=10/${session.lat}/${session.lng}`,
        });

      await message.reply({ embeds: [embed] });
    } else {
      const remaining = recordTry(session, userId, username);

      if (remaining > 0) {
        await message.reply(t.guess.wrong(guess, remaining));
      } else {
        if (allPlayersExhausted(session)) {
          endSession(message.channelId);

          for (const [playerId, entry] of session.playerTries) {
            recordLoss(playerId, entry.username);
          }

          const embed = new EmbedBuilder()
            .setColor(0xff6b6b)
            .setTitle(t.guess.outOfTries)
            .setDescription(t.guess.answerWas(session.answerFlag, session.answer))
            .setFooter({
              text: `📍 https://www.openstreetmap.org/#map=10/${session.lat}/${session.lng}`,
            });

          await message.reply({ embeds: [embed] });
        } else {
          await message.reply(t.guess.outOfTriesOthers(guess));
        }
      }
    }
  } catch (error) {
    console.error("Error in message handler:", error);
  }
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`GeoBot is online as ${readyClient.user.tag}`);

  // Diagnostic: test if Mapillary API is reachable from this process
  try {
    const testUrl = `https://graph.mapillary.com/images?access_token=${config.mapillaryToken}&fields=id,geometry&bbox=2.30,48.85,2.398,48.948&limit=1`;
    const start = Date.now();
    const res = await fetch(testUrl, { signal: AbortSignal.timeout(10000) });
    const data = await res.json() as { data?: unknown[] };
    console.log(`[Diag] Mapillary API: ${res.status} in ${Date.now() - start}ms, found: ${data.data?.length ?? 0}`);
  } catch (e) {
    console.error(`[Diag] Mapillary API FAILED:`, e);
  }
});

async function main(): Promise<void> {
  await registerCommands();
  startPool();
  await client.login(config.discordToken);
}

main().catch(console.error);
