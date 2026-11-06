import { defineCard } from "../define.js";

// EDHREC rank 31977.

export default defineCard({
  name: "Horta",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Trample\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
});
