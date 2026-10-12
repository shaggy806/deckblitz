import { defineCard } from "../define.js";

export default defineCard({
  name: "Daggermaw Megalodon",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shark"],
  power: 5,
  toughness: 7,
  keywords: ["vigilance"],
  cycling: { cost: "{2}", search: { subtype: "Island" } },
  text: "Vigilance\nIslandcycling {2} ({2}, Discard this card: Search your library for an Island card, reveal it, put it into your hand, then shuffle.)",
});
