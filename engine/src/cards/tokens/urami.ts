import { defineCard } from "../define.js";

/**
 * Tomb of Urami's token — "Urami, a legendary 5/5 black Demon Spirit creature
 * token with flying". A named legendary token, so the legend rule applies to
 * two of them. The Oracle snapshot lists no token printing of it (2026-11-20).
 */
export default defineCard({
  name: "Urami",
  supertypes: ["legendary"],
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying",
});
