import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { getLang } from "../i18n";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("How to play GeoBot");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const t = getLang(interaction.guildId);

  const embed = new EmbedBuilder()
    .setColor(0x00b4d8)
    .setTitle(t.help.title)
    .setDescription(t.help.description)
    .addFields(
      { name: t.help.commandsTitle, value: t.help.commandsList },
      { name: t.help.tipsTitle, value: t.help.tipsList }
    )
    .setFooter({ text: t.help.footer });

  await interaction.reply({ embeds: [embed] });
}
