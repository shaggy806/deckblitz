import { defineCard } from "../define.js";

// EDHREC rank 9614.

export default defineCard({
  name: "Even the Score",
  manaCost: "{X}{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "turn-stat", stat: "cards-drawn", who: "opponent", atLeast: 4 },
    reduceColored: "{U}{U}{U}",
  },
  text: "This spell costs {U}{U}{U} less to cast if an opponent has drawn four or more cards this turn.\nDraw X cards.",
  effect: { kind: "draw", amount: "x" },
});
