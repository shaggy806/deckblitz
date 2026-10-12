import { defineCard } from "../define.js";

export default defineCard({
  name: "Fearsome Werewolf",
  art: "https://cards.scryfall.io/art_crop/back/5/e/5eb3a08e-1d31-4ab9-854f-a86b060696ec.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 3,
  keywords: ["menace", "nightbound"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  faces: ["Fearful Villager", "Fearsome Werewolf"],
  transform: true,
});
