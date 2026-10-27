import { defineCard } from "../define.js";

// EDHREC rank 28764.
//
// Rulings:
//   Triggers once per creature you have that blocks. Does not trigger multiple times when a
//     single creature blocks more than one attacker.

const TEXT = "Whenever a creature you control blocks, you gain 2 life.";

export default defineCard({
  name: "Noble Stand",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
