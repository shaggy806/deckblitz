import { defineCard } from "../define.js";

// EDHREC rank 10806.
//
// Merciless Eviction's chosen-as-cast modes; each power comparison is a
// `{ amount }` operand, bound to the hand's size as the exile applies — the
// spell itself is on the stack then, so not counted (the rulings).
//
// Rulings:
//   [2019-08-23] The power of creatures and the number of cards in your hand are checked only as
//     Nightmare Unmaking resolves. Players may respond to the spell knowing the chosen mode to try
//     to save or doom a creature.
//   [2019-08-23] Because Nightmare Unmaking is on the stack while it's resolving, it won't be
//     counted among the cards in your hand.

const GREATER = "Exile each creature with power greater than the number of cards in your hand.";
const LESS = "Exile each creature with power less than the number of cards in your hand.";

export default defineCard({
  name: "Nightmare Unmaking",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Choose one —\n• ${GREATER}\n• ${LESS}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        targets: [],
        text: GREATER,
        effect: {
          kind: "exile-all",
          filter: { type: "creature", power: { op: "gt", n: { amount: { cardsInHand: "you" } } } },
        },
      },
      {
        targets: [],
        text: LESS,
        effect: {
          kind: "exile-all",
          filter: { type: "creature", power: { op: "lt", n: { amount: { cardsInHand: "you" } } } },
        },
      },
    ],
  },
});
