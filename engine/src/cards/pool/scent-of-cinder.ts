import { defineCard } from "../define.js";

// EDHREC rank 29830.
//
// Rulings:
//   [2004-10-04] You reveal cards, and thereby set the value of X, on resolution.

const TEXT =
  "Reveal any number of red cards in your hand. Scent of Cinder deals X damage to any target, where X is the number of cards revealed this way.";

export default defineCard({
  name: "Scent of Cinder",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: { cardsInHand: "you" },
        filter: { colors: ["R"] },
        destination: "reveal",
        leftover: "stay",
      },
      { kind: "damage", target: 0, amount: { thisWay: "revealed", who: "you" } },
    ],
  },
});
