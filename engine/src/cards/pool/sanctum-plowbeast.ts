import { defineCard } from "../define.js";

// EDHREC rank 22524.

export default defineCard({
  name: "Sanctum Plowbeast",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 6,
  keywords: ["defender"],
  cycling: { cost: "{2}", search: { subtype: "Plains" }, name: "Plainscycling" },
  text: "Defender\nPlainscycling {2}, islandcycling {2} ({2}, Discard this card: Search your library for a Plains or Island card, reveal it, put it into your hand, then shuffle.)",
  moreCycling: [{ cost: "{2}", search: { subtype: "Island" }, name: "Islandcycling" }],
});
