import { defineCard } from "../define.js";

export default defineCard({
  name: "Stalking Predator",
  art: "https://cards.scryfall.io/art_crop/back/5/5/55f0666a-5c3e-492b-b4ea-42fa7f24661b.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["menace", "nightbound"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  faces: ["Shady Traveler", "Stalking Predator"],
  transform: true,
});
