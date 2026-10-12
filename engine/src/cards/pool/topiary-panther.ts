import { defineCard } from "../define.js";

export default defineCard({
  name: "Topiary Panther",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Cat"],
  power: 6,
  toughness: 5,
  keywords: ["trample"],
  cycling: { cost: "{1}{G}", search: { supertype: "basic", type: "land" } },
  text: "Trample\nBasic landcycling {1}{G} ({1}{G}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
});
