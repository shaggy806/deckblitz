import { defineCard } from "../define.js";

export default defineCard({
  name: "Furnace Host Charger",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Giant"],
  power: 5,
  toughness: 5,
  keywords: ["haste"],
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: "Haste\nMountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)",
});
