import { defineCard } from "../define.js";

export default defineCard({
  name: "Hill Gigas",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 4,
  keywords: ["trample", "haste"],
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: "Trample, haste\nMountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)",
});
