import { defineCard } from "../define.js";

// EDHREC rank 23078.
//
// Rulings:
//   [2016-01-22] The ability can trigger only once each turn. The ability will resolve before the
//     second spell resolves. It doesn't matter if the first spell you cast that turn has
//     resolved, was countered, or is still on the stack.

const TEXT = "Whenever you cast your second spell each turn, this enchantment deals 2 damage to any target.";

export default defineCard({
  name: "Pyromancer's Assault",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
