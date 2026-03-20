import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { getPlayerStats } from "../services/leaderboard";
import { getLang } from "../i18n";

export const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Show your GeoGuessr stats")
  .addUserOption((option) =>
    option
      .setName("player")
      .setDescription("Check another player's stats")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const t = getLang(interaction.guildId);
  const targetUser = interaction.options.getUser("player") ?? interaction.user;

  const stats = getPlayerStats(targetUser.id);

  if (!stats) {
    await interaction.reply({
      content: targetUser.id === interaction.user.id
        ? t.stats.noGames
        : t.stats.noGamesOther(targetUser.username),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const winRate = stats.games_played > 0
    ? Math.round((stats.wins / stats.games_played) * 100)
    : 0;

  const embed = new EmbedBuilder()
    .setColor(0x00b4d8)
    .setTitle(t.stats.title(stats.username))
    .addFields(
      { name: "🏆 Wins", value: `${stats.wins}`, inline: true },
      { name: "🎮 Games", value: `${stats.games_played}`, inline: true },
      { name: "📈 Win Rate", value: `${winRate}%`, inline: true },
      { name: "🔥 Streak", value: `${stats.current_streak}`, inline: true },
      { name: "⭐ Best", value: `${stats.best_streak}`, inline: true }
    );

  await interaction.reply({ embeds: [embed] });
}
