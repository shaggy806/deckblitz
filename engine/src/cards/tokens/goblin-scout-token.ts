import { defineCard } from "../define.js";

/** 1/1 red Goblin Scout with mountainwalk — Goblin Scouts' token. Scryfall
 * lists no token printing of it (the Oracle snapshot, 2026-10-25), so it has
 * no art. */
export default defineCard({
  name: "Goblin Scout Token",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout"],
  power: 1,
  toughness: 1,
  keywords: ["mountainwalk"],
  text: "Mountainwalk (This creature can't be blocked as long as defending player controls a Mountain.)",
});
