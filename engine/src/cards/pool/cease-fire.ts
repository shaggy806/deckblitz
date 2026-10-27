import { defineCard } from "../define.js";

// EDHREC rank 24133.
//
// Rulings:
//   [2004-10-04] This spell will not counter any creature spells on the stack. It only prevents
//     new creature spells from being cast after it resolves.

export default defineCard({
  name: "Cease-Fire",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player can't cast creature spells this turn.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prohibit", who: 0, spells: { filter: { type: "creature" }, label: "creature spells" } },
      { kind: "draw", amount: 1 },
    ],
  },
});
