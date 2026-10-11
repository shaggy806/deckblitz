import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Banned in Commander; in the pool for casual play.
//
// Rulings:
//   [2020-08-07] No player may choose to take actions between determining the result of the flip
//     and damage being dealt if you lost the flip.
//
// The damage is the flip's `lost` branch, part of the same resolution.

const FLIP_TEXT =
  "At the beginning of your upkeep, flip a coin. If you lose the flip, this artifact deals 3 damage to you.";

export default defineCard({
  name: "Mana Crypt",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: `${FLIP_TEXT}\n{T}: Add {C}{C}.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "flip-coin", lost: { kind: "damage", amount: 3, who: "you" } },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
  activated: [addManaAbility({ mana: "C", amount: 2, text: "{T}: Add {C}{C}." })],
});
