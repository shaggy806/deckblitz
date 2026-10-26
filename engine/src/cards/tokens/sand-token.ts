import { defineCard } from "../define.js";

/** 1/1 colorless Sand creature token (Dune-Brood Nephilim). Scryfall lists no
 * printing of it (the Oracle snapshot, 2026-10-26), so it pins no art. */
export default defineCard({
  name: "Sand Token",
  colors: [],
  types: ["creature"],
  subtypes: ["Sand"],
  power: 1,
  toughness: 1,
});
