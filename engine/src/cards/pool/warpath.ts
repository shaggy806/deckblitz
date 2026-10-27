import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 30970.
//
// A blocked creature is an attacker that isn't unblocked once blockers are
// declared (rule 509.1h) — before then an attacker is neither, so the
// "blocked" half is gated on the steps from declare blockers on, as
// Tattermunge Witch's is. All the damage is dealt at once.

export default defineCard({
  name: "Warpath",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Warpath deals 3 damage to each blocking creature and each blocked creature.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
    then: {
      kind: "damage-all",
      amount: 3,
      filter: { type: "creature", anyOf: [{ blocking: true }, { attacking: true, unblocked: false }] },
    },
    else: { kind: "damage-all", amount: 3, filter: { type: "creature", blocking: true } },
  },
});
