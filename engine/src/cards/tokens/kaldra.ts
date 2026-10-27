import { defineCard } from "../define.js";

/**
 * Helm of Kaldra's token — "Kaldra, a legendary 4/4 colorless Avatar creature
 * token". A named legendary token, so the legend rule applies to two of them.
 * Scryfall lists no token printing of it (the Oracle snapshot, 2026-10-26).
 */
export default defineCard({
  name: "Kaldra",
  supertypes: ["legendary"],
  colors: [],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 4,
  toughness: 4,
  text: "",
});
