import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "../config";
import { generateRandomLocation } from "../services/location";
import { fetchNearbyImage, fetchRandomImageParallel } from "../services/mapillary";
import { reverseGeocode } from "../services/geocoding";
import { createSession } from "../game/session";
import {
  hasActiveSession,
  setSession,
  endSession,
  markPending,
  clearPending,
} from "../game/manager";
import { getCountryByName } from "../game/matcher";
import { getLang, getLangKey } from "../i18n";
import { recordLoss } from "../services/leaderboard";
import { takeLocation } from "../services/location-pool";

export const data = new SlashCommandBuilder()
  .setName("geo")
  .setDescription("Start a new GeoGuessr round! Guess the country from the image.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const channelId = interaction.channelId;
  const t = getLang(interaction.guildId);

  if (hasActiveSession(channelId)) {
    await interaction.reply({
      content: t.geo.alreadyActive,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Mark channel as pending to prevent race condition
  markPending(channelId);
  await interaction.deferReply();

  // Try pre-validated pool first (instant), fall back to real-time fetching
  let image: { thumbUrl: string; lat: number; lng: number } | null = null;
  let country = "";
  let countryFlag = "";
  let countryCode = "";

  const pooled = takeLocation();
  if (pooled) {
    image = { thumbUrl: pooled.imageUrl, lat: pooled.lat, lng: pooled.lng };
    country = pooled.country;
    countryFlag = pooled.countryFlag;
    countryCode = pooled.countryCode;
  } else {
    // Fallback: try parallel batches of random locations
    try {
      for (let batch = 0; batch < config.game.maxRetries; batch++) {
        const result = await fetchRandomImageParallel();
        if (!result) continue;

        const geocodedCountry = await reverseGeocode(result.image.lat, result.image.lng);
        if (!geocodedCountry) continue;

        const matched = getCountryByName(geocodedCountry);
        if (!matched) continue;

        image = result.image;
        country = matched.name;
        countryFlag = matched.flag;
        countryCode = matched.code;
        break;
      }
    } catch (error) {
      console.error("Error during image search:", error);
    }
  }

  if (!image) {
    clearPending(channelId);
    await interaction.editReply(t.geo.notFound);
    return;
  }

  const langKey = getLangKey(interaction.guildId);
  const countryObj = getCountryByName(country);
  const displayAnswer = langKey === "fr" && countryObj ? countryObj.frenchName : country;

  const session = createSession(
    country,
    displayAnswer,
    countryFlag,
    countryCode,
    image.thumbUrl,
    image.lat,
    image.lng,
    interaction.user.id
  );

  // Store session BEFORE setting timeout
  setSession(channelId, session);

  session.timeout = setTimeout(async () => {
    try {
      const ended = endSession(channelId);
      if (!ended) return;

      // Record losses for all participants
      for (const [playerId, entry] of ended.playerTries) {
        recordLoss(playerId, entry.username);
      }

      const channel = interaction.channel;
      if (!channel || !("send" in channel)) return;

      const timeoutEmbed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle(t.geo.timesUp)
        .setDescription(t.geo.timesUpDesc(ended.answerFlag, ended.displayAnswer))
        .setFooter({
          text: `📍 https://www.openstreetmap.org/#map=10/${ended.lat}/${ended.lng}`,
        });

      await channel.send({ embeds: [timeoutEmbed] });
    } catch (error) {
      console.error("Error in timeout handler:", error);
    }
  }, config.game.roundTimeoutMs);

  const embed = new EmbedBuilder()
    .setColor(0x00b4d8)
    .setTitle(t.geo.title)
    .setDescription(t.geo.description(config.game.maxTries))
    .setImage(image.thumbUrl)
    .setFooter({ text: t.geo.startedBy(interaction.user.username) });

  await interaction.editReply({ embeds: [embed] });
}
