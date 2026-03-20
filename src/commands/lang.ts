import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { setGuildLang, type LangKey } from "../i18n";

export const data = new SlashCommandBuilder()
  .setName("lang")
  .setDescription("Switch the bot language / Changer la langue du bot")
  .addStringOption((option) =>
    option
      .setName("language")
      .setDescription("Choose a language")
      .setRequired(true)
      .addChoices(
        { name: "English", value: "en" },
        { name: "Français", value: "fr" }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const lang = interaction.options.getString("language", true) as LangKey;
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  setGuildLang(guildId, lang);

  const confirmations: Record<LangKey, string> = {
    en: "Language set to **English** for this server.",
    fr: "Langue changée en **Français** pour ce serveur.",
  };

  await interaction.reply(confirmations[lang]);
}
