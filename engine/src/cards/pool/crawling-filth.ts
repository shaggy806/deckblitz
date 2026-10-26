import { defineCard } from "../define.js";
import { soulshift } from "../helpers.js";

// EDHREC rank 27932.

export default defineCard({
  name: "Crawling Filth",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nSoulshift 5 (When this creature dies, you may return target Spirit card with mana value 5 or less from your graveyard to your hand.)",
  triggered: [soulshift(5)],
});
