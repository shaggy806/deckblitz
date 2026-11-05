import { defineCard } from "../define.js";

// EDHREC rank 22714.

export default defineCard({
  name: "Pale Recluse",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 4,
  toughness: 5,
  keywords: ["reach"],
  cycling: { cost: "{2}", search: { subtype: "Forest" }, name: "Forestcycling" },
  text: "Reach (This creature can block creatures with flying.)\nForestcycling {2}, plainscycling {2} ({2}, Discard this card: Search your library for a Forest or Plains card, reveal it, put it into your hand, then shuffle.)",
  moreCycling: [{ cost: "{2}", search: { subtype: "Plains" }, name: "Plainscycling" }],
});
