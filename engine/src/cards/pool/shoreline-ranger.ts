import { defineCard } from "../define.js";

export default defineCard({
  name: "Shoreline Ranger",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier", "Ranger"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  cycling: { cost: "{2}", search: { subtype: "Island" } },
  text: "Flying\nIslandcycling {2} ({2}, Discard this card: Search your library for an Island card, reveal it, put it into your hand, then shuffle.)",
});
