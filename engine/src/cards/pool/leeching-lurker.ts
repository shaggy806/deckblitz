import { defineCard } from "../define.js";

// The back face of Curse of Leeches.
export default defineCard({
  name: "Leeching Lurker",
  art: "https://cards.scryfall.io/art_crop/back/0/a/0a3c8532-92f5-41db-92b4-a871aa05e0c7.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink", "nightbound"],
  text: "Lifelink\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  faces: ["Curse of Leeches", "Leeching Lurker"],
  transform: true,
});
