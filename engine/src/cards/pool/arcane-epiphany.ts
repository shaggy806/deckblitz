import { defineCard } from "../define.js";

// EDHREC rank 11184.

export default defineCard({
  name: "Arcane Epiphany",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if you control a Wizard.\nDraw three cards.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  targets: [],
  effect: { kind: "draw", amount: 3 },
});
