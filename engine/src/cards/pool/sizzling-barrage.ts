import { defineCard } from "../define.js";

// Any creature declared as a blocker this turn, the combat over or not. One put
// onto the battlefield blocking never "blocked" (rule 509.4).

export default defineCard({
  name: "Sizzling Barrage",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Sizzling Barrage deals 4 damage to target creature that blocked this turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", blockedThisTurn: { relation: "blocked" } } }],
  effect: { kind: "damage", target: 0, amount: 4 },
});
