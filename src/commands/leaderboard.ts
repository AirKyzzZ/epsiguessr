import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { getTopPlayers } from "../services/leaderboard";
import { getLang } from "../i18n";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Show the top 10 GeoGuessr players");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const t = getLang(interaction.guildId);
  const players = getTopPlayers();

  if (players.length === 0) {
    await interaction.reply({
      content: t.leaderboard.empty,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  const lines = players.map((p, i) => {
    const prefix = medals[i] ?? `**${i + 1}.**`;
    const winRate = p.games_played > 0
      ? Math.round((p.wins / p.games_played) * 100)
      : 0;
    return `${prefix} **${p.username}** — ${p.wins} wins (${t.leaderboard.winRate(winRate)}) | ${t.leaderboard.bestStreak(p.best_streak)}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle(t.leaderboard.title)
    .setDescription(lines.join("\n"))
    .setFooter({ text: t.leaderboard.playerCount(players.length) });

  await interaction.reply({ embeds: [embed] });
}
