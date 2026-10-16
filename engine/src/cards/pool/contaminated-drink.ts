import { defineCard } from "../define.js";

// EDHREC rank 8650.
//
// "Half X, rounded up" is the `half` amount over the spell's X (rule 107.1a).

export default defineCard({
  name: "Contaminated Drink",
  manaCost: "{X}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Draw X cards, then you get half X rad counters, rounded up.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: "x" },
      { kind: "add-player-counters", counter: "rad", amount: { half: "x", round: "up" } },
    ],
  },
});
