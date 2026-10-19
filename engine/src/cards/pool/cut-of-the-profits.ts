import { defineCard } from "../define.js";

// EDHREC rank 11948. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] X will be the same for both the original spell and the copy you create with the
//     casualty ability.
//   [2022-04-29] If you pay the casualty cost of a spell, the copy will resolve before the original
//     spell.
//
// A copy of a spell copies the value chosen for X (rule 707.10), so both draw X.
export default defineCard({
  name: "Cut of the Profits",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  casualty: 3,
  text:
    "Casualty 3 (As you cast this spell, you may sacrifice a creature with power 3 or greater. When you do, copy this spell.)\n" +
    "You draw X cards and you lose X life.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: "x" },
      { kind: "lose-life", amount: "x" },
    ],
  },
});
