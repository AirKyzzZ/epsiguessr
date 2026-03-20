import { getGuildLang, setGuildLangDb } from "./services/leaderboard";

export type LangKey = "en" | "fr";

export function setGuildLang(guildId: string, lang: LangKey): void {
  setGuildLangDb(guildId, lang);
}

export function getLang(guildId: string | null): typeof en {
  const lang = guildId ? (getGuildLang(guildId) as LangKey | undefined) ?? "en" : "en";
  return lang === "fr" ? fr : en;
}

const en = {
  geo: {
    alreadyActive: "There's already an active round in this channel! Guess the country or use `/skip` to skip.",
    searching: "Searching for a street view image...",
    notFound: "Couldn't find a street view image this time. Try again!",
    title: "🌍 GeoGuessr — Guess the country!",
    description: (tries: number) =>
      `Type your guess in the chat.\nYou have **${tries} tries** per person.\n⏱️ Round expires in 2 minutes.`,
    startedBy: (username: string) => `Round started by ${username}`,
    timesUp: "Time's up!",
    timesUpDesc: (flag: string, answer: string) =>
      `Nobody guessed it! The answer was **${flag} ${answer}**`,
  },
  guess: {
    correct: "Correct! 🎉",
    correctDesc: (username: string, flag: string, answer: string) =>
      `**${username}** guessed it! The answer was **${flag} ${answer}**`,
    wrong: (guess: string, remaining: number) =>
      `❌ Not **${guess}**. You have **${remaining}** ${remaining === 1 ? "try" : "tries"} left.`,
    outOfTries: "Everyone's out of tries!",
    outOfTriesOthers: (guess: string) =>
      `❌ Not **${guess}**. You're out of tries! Other players can still guess.`,
    answerWas: (flag: string, answer: string) =>
      `The answer was **${flag} ${answer}**`,
  },
  hint: {
    noRound: "No active round! Start one with `/geo`.",
    continent: (continent: string) => `🗺️ **Hint**: This country is in **${continent}**`,
    firstLetter: (letter: string) => `🔤 **Hint**: The country name starts with **${letter}**`,
    letterCount: (count: number) => `📏 **Hint**: The country name has **${count}** letters`,
    noMoreHints: "No more hints available for this round!",
  },
  leaderboard: {
    empty: "No games have been played yet! Start one with `/geo`.",
    title: "🏆 GeoGuessr Leaderboard",
    playerCount: (n: number) => `${n} players ranked`,
    winRate: (rate: number) => `${rate}% win rate`,
    bestStreak: (n: number) => `🔥 Best streak: ${n}`,
  },
  stats: {
    noGames: "You haven't played any games yet! Start one with `/geo`.",
    noGamesOther: (username: string) => `${username} hasn't played any games yet.`,
    title: (username: string) => `📊 Stats for ${username}`,
  },
  skip: {
    noRound: "There's no active round to skip! Start one with `/geo`.",
    skipped: "Round skipped!",
    answerWas: (flag: string, answer: string) =>
      `The answer was **${flag} ${answer}**`,
  },
  help: {
    title: "🌍 GeoBot — How to Play",
    description:
      "A street view image is shown. Guess which country it's from!\nType your answer directly in the chat.",
    commandsTitle: "Commands",
    commandsList: [
      "`/geo` — Start a new round",
      "`/hint` — Get a hint (continent → first letter → letter count)",
      "`/skip` — Skip the round and reveal the answer",
      "`/leaderboard` — Top 10 players",
      "`/stats` — Your stats (or mention a player)",
      "`/lang` — Switch language (English/French)",
      "`/help` — This message",
    ].join("\n"),
    tipsTitle: "Tips",
    tipsList: [
      "You get **3 tries** per round",
      "Typos are forgiven (e.g. \"Frnace\" → France)",
      "Aliases work too (USA, UK, Holland...)",
      "Round expires after **2 minutes**",
      "Use `/hint` if you're stuck!",
    ].join("\n"),
    footer: "Images from Mapillary • Geocoding by OpenStreetMap",
  },
};

const fr: typeof en = {
  geo: {
    alreadyActive: "Il y a déjà une manche en cours ! Devinez le pays ou utilisez `/skip`.",
    searching: "Recherche d'une image street view...",
    notFound: "Impossible de trouver une image cette fois. Réessayez !",
    title: "🌍 GeoGuessr — Devinez le pays !",
    description: (tries: number) =>
      `Tapez votre réponse dans le chat.\nVous avez **${tries} essais** par personne.\n⏱️ La manche expire dans 2 minutes.`,
    startedBy: (username: string) => `Manche lancée par ${username}`,
    timesUp: "Temps écoulé !",
    timesUpDesc: (flag: string, answer: string) =>
      `Personne n'a trouvé ! La réponse était **${flag} ${answer}**`,
  },
  guess: {
    correct: "Correct ! 🎉",
    correctDesc: (username: string, flag: string, answer: string) =>
      `**${username}** a trouvé ! La réponse était **${flag} ${answer}**`,
    wrong: (guess: string, remaining: number) =>
      `❌ Pas **${guess}**. Il vous reste **${remaining}** ${remaining === 1 ? "essai" : "essais"}.`,
    outOfTries: "Tout le monde a épuisé ses essais !",
    outOfTriesOthers: (guess: string) =>
      `❌ Pas **${guess}**. Vous n'avez plus d'essais ! D'autres joueurs peuvent encore deviner.`,
    answerWas: (flag: string, answer: string) =>
      `La réponse était **${flag} ${answer}**`,
  },
  hint: {
    noRound: "Pas de manche en cours ! Lancez-en une avec `/geo`.",
    continent: (continent: string) => `🗺️ **Indice** : Ce pays est en **${continent}**`,
    firstLetter: (letter: string) => `🔤 **Indice** : Le nom du pays commence par **${letter}**`,
    letterCount: (count: number) => `📏 **Indice** : Le nom du pays a **${count}** lettres`,
    noMoreHints: "Plus d'indices disponibles pour cette manche !",
  },
  leaderboard: {
    empty: "Aucune partie jouée ! Lancez-en une avec `/geo`.",
    title: "🏆 Classement GeoGuessr",
    playerCount: (n: number) => `${n} joueurs classés`,
    winRate: (rate: number) => `${rate}% de victoires`,
    bestStreak: (n: number) => `🔥 Meilleure série : ${n}`,
  },
  stats: {
    noGames: "Vous n'avez pas encore joué ! Lancez une partie avec `/geo`.",
    noGamesOther: (username: string) => `${username} n'a pas encore joué.`,
    title: (username: string) => `📊 Stats de ${username}`,
  },
  skip: {
    noRound: "Pas de manche en cours ! Lancez-en une avec `/geo`.",
    skipped: "Manche passée !",
    answerWas: (flag: string, answer: string) =>
      `La réponse était **${flag} ${answer}**`,
  },
  help: {
    title: "🌍 GeoBot — Comment jouer",
    description:
      "Une image street view est affichée. Devinez de quel pays il s'agit !\nTapez votre réponse directement dans le chat.",
    commandsTitle: "Commandes",
    commandsList: [
      "`/geo` — Lancer une nouvelle manche",
      "`/hint` — Obtenir un indice (continent → première lettre → nombre de lettres)",
      "`/skip` — Passer la manche et révéler la réponse",
      "`/leaderboard` — Top 10 des joueurs",
      "`/stats` — Vos stats (ou mentionnez un joueur)",
      "`/lang` — Changer la langue (Anglais/Français)",
      "`/help` — Ce message",
    ].join("\n"),
    tipsTitle: "Astuces",
    tipsList: [
      "Vous avez **3 essais** par manche",
      "Les fautes de frappe sont pardonnées (ex: \"Frnace\" → France)",
      "Les alias fonctionnent aussi (USA, UK, Holland...)",
      "La manche expire après **2 minutes**",
      "Utilisez `/hint` si vous êtes bloqué !",
    ].join("\n"),
    footer: "Images par Mapillary • Géocodage par OpenStreetMap",
  },
};
