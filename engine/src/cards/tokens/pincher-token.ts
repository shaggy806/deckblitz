import { defineCard } from "../define.js";

/** 2/2 colorless Pincher creature token (Summoning Station). Scryfall lists no
 * printing of it (the Oracle snapshot, 2026-10-26), so it pins no art. */
export default defineCard({
  name: "Pincher Token",
  colors: [],
  types: ["creature"],
  subtypes: ["Pincher"],
  power: 2,
  toughness: 2,
});
