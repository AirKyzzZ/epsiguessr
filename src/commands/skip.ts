import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { endSession, getSession } from "../game/manager";
import { getLang } from "../i18n";
import { recordLoss } from "../services/leaderboard";

export const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip the current GeoGuessr round and reveal the answer");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const t = getLang(interaction.guildId);
  const channelId = interaction.channelId;
  const session = getSession(channelId);

  if (!session) {
    await interaction.reply({
      content: t.skip.noRound,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const ended = endSession(channelId);
  if (!ended) return;

  // Record losses for all participants
  for (const [playerId, entry] of ended.playerTries) {
    recordLoss(playerId, entry.username);
  }

  const embed = new EmbedBuilder()
    .setColor(0xff6b6b)
    .setTitle(t.skip.skipped)
    .setDescription(t.skip.answerWas(ended.answerFlag, ended.displayAnswer))
    .setFooter({
      text: `📍 https://www.openstreetmap.org/#map=10/${ended.lat}/${ended.lng}`,
    });

  await interaction.reply({ embeds: [embed] });
}
