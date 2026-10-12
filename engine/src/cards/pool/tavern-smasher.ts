import { defineCard } from "../define.js";

export default defineCard({
  name: "Tavern Smasher",
  art: "https://cards.scryfall.io/art_crop/back/1/d/1d7b2d05-ce5c-4b73-8fa6-d9b69619d58c.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 5,
  keywords: ["nightbound"],
  text: "Nightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  faces: ["Tavern Ruffian", "Tavern Smasher"],
  transform: true,
});
