import { defineCard } from "../define.js";

export default defineCard({
  name: "Skulltap",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nDraw two cards.",
  effect: { kind: "draw", amount: 2 },
});
