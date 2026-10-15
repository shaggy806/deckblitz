import { defineCard } from "../define.js";

// EDHREC rank 16454. Broken Wings, then surveil 1.
//
// Rulings:
//   [2025-07-25] If the target permanent is an illegal target as Shattered Wings tries to
//     resolve, it won't resolve and none of its effects will happen. You won't surveil.

export default defineCard({
  name: "Shattered Wings",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target artifact, enchantment, or creature with flying. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  targets: [
    {
      kind: "permanent",
      filter: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "creature", keyword: "flying" }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "surveil", amount: 1 },
    ],
  },
});
