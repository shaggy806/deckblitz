import { defineCard } from "../define.js";

// EDHREC rank 24867.

export default defineCard({
  name: "Fantastic Bounce",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if it targets a tapped creature.\nReturn target nonland permanent to its owner's hand.\nDraw a card.",
  targets: ["nonland-permanent"],
  targetCostReduction: { filter: { type: "creature", tapped: true }, reduceGeneric: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
