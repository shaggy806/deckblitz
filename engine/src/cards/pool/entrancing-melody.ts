import { defineCard } from "../define.js";

// EDHREC rank 11269.
//
// Rulings:
//   [2017-09-29] If a permanent has {X} in its mana cost, X is considered to be 0.
//   [2017-09-29] The control-change effect of Entrancing Melody lasts indefinitely. It doesn't
//     wear off during the cleanup step.

export default defineCard({
  name: "Entrancing Melody",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Gain control of target creature with mana value X.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "eq", n: "x" } } }],
  effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
});
