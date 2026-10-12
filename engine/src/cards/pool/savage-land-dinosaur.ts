import { defineCard } from "../define.js";

export default defineCard({
  name: "Savage Land Dinosaur",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Trample\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
});
