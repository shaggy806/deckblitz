import { defineCard } from "../define.js";

// Two cycling abilities, each its own: which is chosen as it's activated.
export default defineCard({
  name: "Valley Rannet",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 3,
  text: "Mountaincycling {2}, forestcycling {2} ({2}, Discard this card: Search your library for a Mountain or Forest card, reveal it, put it into your hand, then shuffle.)",
  cycling: { cost: "{2}", search: { subtype: "Mountain" }, name: "Mountaincycling" },
  moreCycling: [{ cost: "{2}", search: { subtype: "Forest" }, name: "Forestcycling" }],
});
