import { defineCard } from "../define.js";

export default defineCard({
  name: "Slavering Branchsnapper",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  cycling: { cost: "{2}", search: { subtype: "Forest" } },
  text: "Trample\nForestcycling {2} ({2}, Discard this card: Search your library for a Forest card, reveal it, put it into your hand, then shuffle.)",
});
