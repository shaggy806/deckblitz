import { defineCard } from "../define.js";

// EDHREC rank 15275.
//
// Rulings:
//   X can be zero.

export default defineCard({
  name: "Dregs of Sorrow",
  manaCost: "{X}{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy X target nonblack creatures. Draw X cards.",
  targets: [{ kind: "any-number", of: "nonblack-creature", min: "x", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      { kind: "draw", amount: "x" },
    ],
  },
});
