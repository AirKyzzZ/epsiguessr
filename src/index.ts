import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { config } from "./config";
import { getSession, endSession } from "./game/manager";
import { getPlayerTriesLeft, recordTry } from "./game/session";
import { matchCountry } from "./game/matcher";
import { recordWin, recordLoss } from "./services/leaderboard";

// Import commands
import * as geoCommand from "./commands/geo";
import * as leaderboardCommand from "./commands/leaderboard";
import * as statsCommand from "./commands/stats";
import * as skipCommand from "./commands/skip";

type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const commands = new Collection<string, Command>();
commands.set(geoCommand.data.name, geoCommand as Command);
commands.set(leaderboardCommand.data.name, leaderboardCommand as Command);
commands.set(statsCommand.data.name, statsCommand as Command);
commands.set(skipCommand.data.name, skipCommand as Command);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

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
    const reply = {
      content: "Something went wrong. Try again!",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// Handle guesses via regular messages
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const session = getSession(message.channelId);
  if (!session) return;

  const guess = message.content.trim();

  // Ignore very short or very long messages (probably not guesses)
  if (guess.length < 2 || guess.length > 60) return;

  // Ignore messages that look like commands
  if (guess.startsWith("/") || guess.startsWith("!")) return;

  const userId = message.author.id;
  const username = message.author.username;

  // Check if player has tries left
  const triesLeft = getPlayerTriesLeft(session, userId);
  if (triesLeft <= 0) return; // silently ignore, they're out

  // Check the guess
  const isCorrect = matchCountry(guess, session.answer);

  if (isCorrect) {
    session.winnerId = userId;
    endSession(message.channelId);

    // Record stats
    recordWin(userId, username);

    // Reset streak for all other players who participated
    for (const [playerId] of session.playerTries) {
      if (playerId !== userId) {
        recordLoss(playerId, playerId);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("Correct! 🎉")
      .setDescription(
        `**${username}** guessed it! The answer was **${session.answerFlag} ${session.answer}**`
      )
      .setFooter({
        text: `📍 https://www.openstreetmap.org/#map=10/${session.lat}/${session.lng}`,
      });

    await message.reply({ embeds: [embed] });
  } else {
    const remaining = recordTry(session, userId);

    if (remaining > 0) {
      await message.reply(
        `❌ Not **${guess}**. You have **${remaining}** ${remaining === 1 ? "try" : "tries"} left.`
      );
    } else {
      await message.reply(
        `❌ Not **${guess}**. You're out of tries for this round!`
      );
    }
  }
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`GeoBot is online as ${readyClient.user.tag}`);
});

async function main(): Promise<void> {
  await registerCommands();
  await client.login(config.discordToken);
}

main().catch(console.error);
