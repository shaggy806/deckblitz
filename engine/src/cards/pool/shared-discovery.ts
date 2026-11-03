import { defineCard } from "../define.js";

export default defineCard({
  name: "Shared Discovery",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, tap four untapped creatures you control.\nDraw three cards.",
  additionalCost: {
    also: { text: "Tap four untapped creatures you control", tapUntapped: { filter: { type: "creature" }, count: 4 } },
  },
  effect: { kind: "draw", amount: 3 },
});
