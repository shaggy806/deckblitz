import { defineCard } from "../define.js";

/** 1/1 red Pirate with menace and haste — Daring Piracy's token. */
export default defineCard({
  name: "Pirate Token (Daring Piracy)",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Pirate"],
  power: 1,
  toughness: 1,
  keywords: ["menace", "haste"],
  text: "Menace, haste",
});
