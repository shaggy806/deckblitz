import { defineCard } from "../define.js";

export default defineCard({
  name: "Dire-Strain Brawler",
  art: "https://cards.scryfall.io/art_crop/back/3/e/3e96f9a6-c215-42b1-aa02-8e6143fe5bd7.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance", "nightbound"],
  text: "Vigilance\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  faces: ["Tireless Hauler", "Dire-Strain Brawler"],
  transform: true,
});
