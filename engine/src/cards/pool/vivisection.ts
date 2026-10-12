import { defineCard } from "../define.js";

export default defineCard({
  name: "Vivisection",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nDraw three cards.",
  effect: { kind: "draw", amount: 3 },
});
