import { defineCard } from "../define.js";

export default defineCard({
  name: "Elvish Aberration",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Mutant"],
  power: 4,
  toughness: 5,
  cycling: { cost: "{2}", search: { subtype: "Forest" } },
  text: "{T}: Add {G}{G}{G}.\nForestcycling {2} ({2}, Discard this card: Search your library for a Forest card, reveal it, put it into your hand, then shuffle.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 3 },
      resolve: null,
      text: "{T}: Add {G}{G}{G}.",
    },
  ],
});
