import { defineCard } from "../define.js";

// EDHREC rank 24097.
//
// Rulings:
//   [2019-07-12] If the target creature or planeswalker is an illegal target by the time Devout
//     Decree tries to resolve, the spell doesn't resolve. You won't scry 1.

export default defineCard({
  name: "Devout Decree",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target creature or planeswalker that's black or red. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { typesAnyOf: ["creature", "planeswalker"], anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "scry", amount: 1 },
    ],
  },
});
