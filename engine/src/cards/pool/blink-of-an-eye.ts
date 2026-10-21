import { defineCard } from "../define.js";

// EDHREC rank 8644. Dominaria.
//
// Rulings:
//   [2018-04-27] If the target nonland permanent is an illegal target by the time Blink of an Eye
//     tries to resolve, the spell doesn't resolve. You won't draw a card if it was kicked.
//
// Into the Roil's shape: the kicked cast bounces, then draws.

export default defineCard({
  name: "Blink of an Eye",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)\nReturn target nonland permanent to its owner's hand. If this spell was kicked, draw a card.",
  targets: ["nonland-permanent"],
  effect: { kind: "return-to-hand", target: 0 },
  kicker: {
    cost: "{1}{U}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "return-to-hand", target: 0 },
        { kind: "draw", amount: 1 },
      ],
    },
  },
});
