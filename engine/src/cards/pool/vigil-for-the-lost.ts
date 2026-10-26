import { defineCard } from "../define.js";

// EDHREC rank 28562. Hero of Leina Tower's "you may pay {X}": X is chosen and
// paid as the ability resolves (the ruling).
//
// Rulings:
//   [2011-01-01] As the ability resolves, you choose a value for X and decide whether to pay {X}.
//     If you do decide to pay {X}, it's too late for any player to respond since the ability is
//     already in the midst of resolving.

const TEXT = "Whenever a creature you control dies, you may pay {X}. If you do, you gain X life.";

export default defineCard({
  name: "Vigil for the Lost",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to gain X life?",
        cost: "{X}",
        effect: { kind: "gain-life", amount: "x" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
