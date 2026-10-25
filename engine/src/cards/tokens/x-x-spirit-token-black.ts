import { defineCard } from "../define.js";

/** A black Spirit creature token with no abilities, its P/T set as it's made
 * (`create-token`'s `basePt` — Broken Visage). No Scryfall token printing. */
export default defineCard({
  name: "X/X Spirit Token (Black)",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
});
