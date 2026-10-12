import { defineCard } from "../define.js";

export default defineCard({
  name: "Shardless Outlander",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct", "Scout"],
  power: 6,
  toughness: 5,
  keywords: ["trample"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
});
