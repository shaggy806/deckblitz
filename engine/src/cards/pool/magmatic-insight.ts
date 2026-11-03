import { defineCard } from "../define.js";

export default defineCard({
  name: "Magmatic Insight",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard a land card.\nDraw two cards.",
  additionalCost: { discard: 1, discardFilter: { type: "land" } },
  effect: { kind: "draw", amount: 2 },
});
