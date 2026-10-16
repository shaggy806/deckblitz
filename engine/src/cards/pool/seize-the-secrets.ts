import { defineCard } from "../define.js";

// EDHREC rank 12940.
//
// Winged Words' shape, gated on the crime record (rule 700.13).

export default defineCard({
  name: "Seize the Secrets",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "This spell costs {1} less to cast if you've committed a crime this turn. (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)\nDraw two cards.",
  selfCostReduction: { condition: { kind: "committed-crime-this-turn" }, reduceGeneric: 1 },
  effect: { kind: "draw", amount: 2 },
});
