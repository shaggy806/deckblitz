import { defineCard } from "../define.js";
import { VOID_CONDITION } from "../helpers.js";

// EDHREC rank 19420.
//
// Rulings:
//   [2025-07-25] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you’re paying, add any cost increases, then apply any cost reductions. The mana value
//     of the spell remains unchanged, no matter what the total cost to cast it was.

export default defineCard({
  name: "Temporal Intervention",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  selfCostReduction: { condition: VOID_CONDITION, reduceGeneric: 2 },
  text: "Void — This spell costs {2} less to cast if a nonland permanent left the battlefield this turn or a spell was warped this turn.\nTarget opponent reveals their hand. You choose a nonland card from it. That player discards that card.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
});
