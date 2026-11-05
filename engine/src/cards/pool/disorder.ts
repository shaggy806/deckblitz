import { defineCard } from "../define.js";

// EDHREC rank 31553.
//
// Rulings:
//   [2004-10-04] Players take 0 or 2 damage. Disorder does not do 2 damage per creature to the
//     player.

export default defineCard({
  name: "Disorder",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Disorder deals 2 damage to each white creature and each player who controls a white creature.",
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", colors: ["W"] }, amount: 2 },
      {
        kind: "damage",
        amount: 2,
        who: "each-player",
        whoseIf: {
          kind: "of-player",
          player: "that-player",
          condition: { kind: "controls", filter: { type: "creature", colors: ["W"] }, atLeast: 1 },
        },
      },
    ],
  },
});
