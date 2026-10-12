import { defineCard } from "../define.js";

export default defineCard({
  name: "Timberland Ancient",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 6,
  toughness: 5,
  keywords: ["reach", "trample"],
  cycling: { cost: "{2}", search: { subtype: "Forest" } },
  text: "Reach, trample\nForestcycling {2} ({2}, Discard this card: Search your library for a Forest card, reveal it, put it into your hand, then shuffle.)",
});
