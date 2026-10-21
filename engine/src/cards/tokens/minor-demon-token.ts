import { defineCard } from "../define.js";

/** "A 1/1 black and red Demon creature token named Minor Demon" (Boris
 * Devilboon). Scryfall lists no token printing for it (the Oracle snapshot,
 * 2026-10-21), so it has no art pin. */
export default defineCard({
  name: "Minor Demon Token",
  tokenName: "Minor Demon",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 1,
  toughness: 1,
  text: "",
});
