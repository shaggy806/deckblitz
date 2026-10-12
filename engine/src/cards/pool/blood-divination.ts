import { defineCard } from "../define.js";

export default defineCard({
  name: "Blood Divination",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nDraw three cards.",
  effect: { kind: "draw", amount: 3 },
});
