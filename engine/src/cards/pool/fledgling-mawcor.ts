import { defineCard } from "../define.js";

export default defineCard({
  name: "Fledgling Mawcor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{U}{U}" },
  text: "Flying\n{T}: This creature deals 1 damage to any target.\nMorph {U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to any target.",
    },
  ],
});
