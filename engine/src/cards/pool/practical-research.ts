import { defineCard } from "../define.js";

// EDHREC rank 13627.
//
// Rulings:
//   [2021-04-16] As Practical Research resolves, you can discard either one instant or sorcery
//     card or discard two cards, each of which may or may not be an instant or sorcery card.
//
// Thirst for Identity's shape: `discard`'s `unlessOne`.
export default defineCard({
  name: "Practical Research",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Draw four cards. Then discard two cards unless you discard an instant or sorcery card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 4 },
      { kind: "discard", target: "you", amount: 2, unlessOne: { typesAnyOf: ["instant", "sorcery"] } },
    ],
  },
});
