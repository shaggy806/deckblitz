import { defineCard } from "../define.js";

export default defineCard({
  name: "Wirewood Guardian",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Mutant"],
  power: 6,
  toughness: 6,
  cycling: { cost: "{2}", search: { subtype: "Forest" } },
  text: "Forestcycling {2} ({2}, Discard this card: Search your library for a Forest card, reveal it, put it into your hand, then shuffle.)",
});
