import { defineCard } from "../define.js";

// EDHREC rank 13628.

export default defineCard({
  name: "Reckless Spite",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy two target nonblack creatures. You lose 5 life.",
  targets: [{ kind: "any-number", of: "nonblack-creature", min: 2, max: 2 }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      { kind: "lose-life", amount: 5, who: "you" },
    ],
  },
});
