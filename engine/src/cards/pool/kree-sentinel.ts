import { defineCard } from "../define.js";

export default defineCard({
  name: "Kree Sentinel",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Kree", "Robot", "Villain"],
  power: 5,
  toughness: 5,
  keywords: ["reach"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Reach\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
});
