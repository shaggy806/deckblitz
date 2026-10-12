import { defineCard } from "../define.js";

// EDHREC rank 11384.
//
// Rulings:
//   [2025-07-25] If the target permanent is an illegal target as Mental Modulation tries to
//     resolve, it won’t resolve and none of its effects will happen. You won’t draw a card.
//   [2025-07-25] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you’re paying, add any cost increases, then apply any cost reductions. The mana value
//     of the spell remains unchanged, no matter what the total cost to cast it was.

export default defineCard({
  name: "Mental Modulation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {1} less to cast during your turn.\nTap target artifact or creature.\nDraw a card.",
  selfCostReduction: { condition: { kind: "your-turn" }, reduceGeneric: 1 },
  targets: ["artifact-or-creature"],
  // Its one target illegal, the spell doesn't resolve and there's no draw
  // (rule 608.2b, the ruling).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
