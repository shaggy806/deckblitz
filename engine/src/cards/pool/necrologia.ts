import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] This spell is cast during the End step. Since you discard down to 7 cards in the
//     cleanup step, this card is used before the discard.

export default defineCard({
  name: "Necrologia",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Cast this spell only during your end step.\nAs an additional cost to cast this spell, pay X life.\nDraw X cards.",
  castOnlyIf: {
    kind: "all",
    of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["end"] }],
  },
  additionalCost: { payLifeX: true },
  targets: [],
  effect: { kind: "draw", amount: "x" },
});
