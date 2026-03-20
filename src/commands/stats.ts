import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { getPlayerStats } from "../services/leaderboard";

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
  const targetUser = interaction.options.getUser("player") ?? interaction.user;

  const stats = getPlayerStats(targetUser.id);

  if (!stats) {
    await interaction.reply({
      content: targetUser.id === interaction.user.id
        ? "You haven't played any games yet! Start one with `/geo`."
        : `${targetUser.username} hasn't played any games yet.`,
      ephemeral: true,
    });
    return;
  }

  const winRate = stats.games_played > 0
    ? Math.round((stats.wins / stats.games_played) * 100)
    : 0;

  const embed = new EmbedBuilder()
    .setColor(0x00b4d8)
    .setTitle(`📊 Stats for ${stats.username}`)
    .addFields(
      { name: "🏆 Wins", value: `${stats.wins}`, inline: true },
      { name: "🎮 Games Played", value: `${stats.games_played}`, inline: true },
      { name: "📈 Win Rate", value: `${winRate}%`, inline: true },
      { name: "🔥 Current Streak", value: `${stats.current_streak}`, inline: true },
      { name: "⭐ Best Streak", value: `${stats.best_streak}`, inline: true }
    );

  await interaction.reply({ embeds: [embed] });
}
