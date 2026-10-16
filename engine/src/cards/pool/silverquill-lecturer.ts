import { defineCard } from "../define.js";
import { demonstrate } from "../helpers.js";

// EDHREC rank 10134. Modern Horizons 3 Commander.
//
// Rulings:
//   [2024-06-07] The copies of a creature spell become tokens as they resolve (they aren't
//     "created"). If both you and an opponent copy it, the opponent's copy resolves first, then
//     yours, then the original.
//   [2024-06-07] Declining to copy it, no opponent copies it either.
//   [2024-06-07] The copies have the original's X and the additional costs paid for it.
//
// Demonstrate (rule 702.144a) is a cast trigger, given to each creature spell
// you cast while it's on the stack (`grantsToSpells` — Prismari's storm,
// The First Sliver's cascade). A copy isn't cast, so it gets no demonstrate
// of its own.
const TEXT =
  "Creature spells you cast have demonstrate. (Whenever you cast a creature spell, you may copy it. If you do, choose an opponent to also copy it. Each copy becomes a token.)";

export default defineCard({
  name: "Silverquill Lecturer",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "creature" }, triggered: [demonstrate()] },
      text: TEXT,
    },
  ],
});
