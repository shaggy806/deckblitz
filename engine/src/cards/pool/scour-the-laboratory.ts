import { defineCard } from "../define.js";

export default defineCard({
  name: "Scour the Laboratory",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Delirium — This spell costs {2} less to cast if there are four or more card types among cards in your graveyard.\nDraw three cards.",
  selfCostReduction: { condition: { kind: "delirium" }, reduceGeneric: 2 },
  targets: [],
  effect: { kind: "draw", amount: 3 },
});
