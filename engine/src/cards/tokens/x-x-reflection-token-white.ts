import { defineCard } from "../define.js";

/** A white Reflection creature token with no abilities, its P/T set as it's
 * made (`create-token`'s `basePt` — Pure Reflection). No Scryfall token printing. */
export default defineCard({
  name: "X/X Reflection Token (White)",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Reflection"],
  power: 0,
  toughness: 0,
});
