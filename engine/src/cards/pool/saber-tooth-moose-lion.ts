import { defineCard } from "../define.js";

export default defineCard({
  name: "Saber-Tooth Moose-Lion",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk", "Cat"],
  power: 7,
  toughness: 7,
  keywords: ["reach"],
  cycling: { cost: "{2}", search: { subtype: "Forest" } },
  text: "Reach\nForestcycling {2} ({2}, Discard this card: Search your library for a Forest card, reveal it, put it into your hand, then shuffle.)",
});
