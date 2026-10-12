import { defineCard } from "../define.js";

export default defineCard({
  name: "Wing Shredder",
  art: "https://cards.scryfall.io/art_crop/back/7/1/71ccc444-54c8-4f7c-a425-82bc3eea1eb0.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 5,
  keywords: ["reach", "nightbound"],
  text: "Reach\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  faces: ["Bird Admirer", "Wing Shredder"],
  transform: true,
});
