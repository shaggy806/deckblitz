import { defineCard } from "../define.js";

// EDHREC rank 22746.
//
// Rulings:
//   [2004-10-04] The ability triggers when it attacks or block and resolves before combat damage
//     is assigned. This gives you a chance to possibly get rid of it before it hurts you.

export default defineCard({
  name: "Goblin Psychopath",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Mutant"],
  power: 5,
  toughness: 5,
  text: "Whenever this creature attacks or blocks, flip a coin. If you lose the flip, the next time it would deal combat damage this turn, it deals that damage to you instead.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "flip-coin",
        lost: { kind: "damage-rule", by: { target: "source" }, combat: true, amount: "next-time", redirectTo: "you" },
      },
      resolve: null,
      text: "Whenever this creature attacks or blocks, flip a coin. If you lose the flip, the next time it would deal combat damage this turn, it deals that damage to you instead.",
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: {
        kind: "flip-coin",
        lost: { kind: "damage-rule", by: { target: "source" }, combat: true, amount: "next-time", redirectTo: "you" },
      },
      resolve: null,
      text: "Whenever this creature attacks or blocks, flip a coin. If you lose the flip, the next time it would deal combat damage this turn, it deals that damage to you instead.",
    },
  ],
});
