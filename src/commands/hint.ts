import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { getSession } from "../game/manager";
import { getContinent } from "../data/continents";
import { getLang, getLangKey } from "../i18n";

export const data = new SlashCommandBuilder()
  .setName("hint")
  .setDescription("Get a hint for the current round (continent, then first letter)");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const t = getLang(interaction.guildId);
  const session = getSession(interaction.channelId);

  if (!session) {
    await interaction.reply({
      content: t.hint.noRound,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  session.hintsUsed++;

  if (session.hintsUsed === 1) {
    const langKey = getLangKey(interaction.guildId);
    const continent = getContinent(session.answerCode, langKey);
    await interaction.reply(t.hint.continent(continent));
  } else if (session.hintsUsed === 2) {
    const firstLetter = session.displayAnswer.charAt(0).toUpperCase();
    await interaction.reply(t.hint.firstLetter(firstLetter));
  } else if (session.hintsUsed === 3) {
    const length = session.displayAnswer.length;
    await interaction.reply(t.hint.letterCount(length));
  } else {
    await interaction.reply({
      content: t.hint.noMoreHints,
      flags: MessageFlags.Ephemeral,
    });
  }
}
