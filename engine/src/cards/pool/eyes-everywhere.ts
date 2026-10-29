import { defineCard } from "../define.js";

// Rule 701.12b: nothing changes hands if one player controls both, or if this
// enchantment has left or the target is illegal as it resolves (the rulings).
// The exchange lasts indefinitely, after this enchantment leaves too.
export default defineCard({
  name: "Eyes Everywhere",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, scry 1.\n{5}{U}: Exchange control of this enchantment and target nonland permanent. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{5}{U}", tap: false },
      targets: ["nonland-permanent"],
      effect: { kind: "exchange-control", objects: ["source", 0] },
      resolve: null,
      text: "{5}{U}: Exchange control of this enchantment and target nonland permanent. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, scry 1.",
    },
  ],
});
