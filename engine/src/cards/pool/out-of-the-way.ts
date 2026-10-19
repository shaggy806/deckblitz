import { defineCard } from "../define.js";

// Streets of New Capenna. Ajani's Response's cost reduction, Petty Theft's
// bounce, then a draw.
export default defineCard({
  name: "Out of the Way",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets a green permanent.\nReturn target nonland permanent an opponent controls to its owner's hand.\nDraw a card.",
  targets: ["nonland-permanent-an-opponent-controls"],
  targetCostReduction: { filter: { colors: ["G"] }, reduceGeneric: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
