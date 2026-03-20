import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { config } from "../config";
import { generateRandomLocation } from "../services/location";
import { fetchNearbyImage } from "../services/mapillary";
import { reverseGeocode } from "../services/geocoding";
import { createSession } from "../game/session";
import { hasActiveSession, setSession, endSession } from "../game/manager";

export const data = new SlashCommandBuilder()
  .setName("geo")
  .setDescription("Start a new GeoGuessr round! Guess the country from the image.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const channelId = interaction.channelId;

  if (hasActiveSession(channelId)) {
    await interaction.reply({
      content: "There's already an active round in this channel! Guess the country or use `/skip` to skip.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  // Try to find a valid image
  let image = null;
  let country = "";
  let countryFlag = "";

  for (let attempt = 0; attempt < config.game.maxRetries; attempt++) {
    const location = generateRandomLocation();

    const result = await fetchNearbyImage(location.lat, location.lng);
    if (!result) continue;

    // Reverse geocode to confirm the country
    const geocodedCountry = await reverseGeocode(result.lat, result.lng);
    if (!geocodedCountry) continue;

    image = result;
    country = geocodedCountry;
    countryFlag = location.country.flag;
    break;
  }

  if (!image) {
    await interaction.editReply(
      "Couldn't find a street view image this time. Try again!"
    );
    return;
  }

  const session = createSession(
    country,
    countryFlag,
    image.thumbUrl,
    image.lat,
    image.lng,
    interaction.user.id
  );

  // Auto-expire after timeout
  session.timeout = setTimeout(async () => {
    const ended = endSession(channelId);
    if (!ended) return;

    const channel = interaction.channel as TextChannel;
    const timeoutEmbed = new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle("Time's up!")
      .setDescription(
        `Nobody guessed it! The answer was **${ended.answerFlag} ${ended.answer}**`
      )
      .setFooter({
        text: `📍 View on map: https://www.openstreetmap.org/#map=10/${ended.lat}/${ended.lng}`,
      });

    await channel.send({ embeds: [timeoutEmbed] });
  }, config.game.roundTimeoutMs);

  setSession(channelId, session);

  const embed = new EmbedBuilder()
    .setColor(0x00b4d8)
    .setTitle("🌍 GeoGuessr — Guess the country!")
    .setDescription(
      `Type your guess in the chat.\nYou have **${config.game.maxTries} tries** per person.\n⏱️ Round expires in 2 minutes.`
    )
    .setImage(image.thumbUrl)
    .setFooter({ text: `Round started by ${interaction.user.username}` });

  await interaction.editReply({ embeds: [embed] });
}
