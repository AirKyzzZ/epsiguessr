import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { endSession, getSession } from "../game/manager";

export const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip the current GeoGuessr round and reveal the answer");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const channelId = interaction.channelId;
  const session = getSession(channelId);

  if (!session) {
    await interaction.reply({
      content: "There's no active round to skip! Start one with `/geo`.",
      ephemeral: true,
    });
    return;
  }

  const ended = endSession(channelId);
  if (!ended) return;

  const embed = new EmbedBuilder()
    .setColor(0xff6b6b)
    .setTitle("Round skipped!")
    .setDescription(
      `The answer was **${ended.answerFlag} ${ended.answer}**`
    )
    .setFooter({
      text: `📍 https://www.openstreetmap.org/#map=10/${ended.lat}/${ended.lng}`,
    });

  await interaction.reply({ embeds: [embed] });
}
