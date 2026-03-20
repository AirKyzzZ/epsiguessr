import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { getTopPlayers } from "../services/leaderboard";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Show the top 10 GeoGuessr players");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const players = getTopPlayers();

  if (players.length === 0) {
    await interaction.reply({
      content: "No games have been played yet! Start one with `/geo`.",
      ephemeral: true,
    });
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  const lines = players.map((p, i) => {
    const prefix = medals[i] ?? `**${i + 1}.**`;
    const winRate = p.games_played > 0
      ? Math.round((p.wins / p.games_played) * 100)
      : 0;
    return `${prefix} **${p.username}** — ${p.wins} wins (${winRate}% win rate) | 🔥 Best streak: ${p.best_streak}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle("🏆 GeoGuessr Leaderboard")
    .setDescription(lines.join("\n"))
    .setFooter({ text: `${players.length} players ranked` });

  await interaction.reply({ embeds: [embed] });
}
