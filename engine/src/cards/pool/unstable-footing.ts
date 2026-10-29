import { defineCard } from "../define.js";

// EDHREC rank 23829.
// Rulings:
//   [2004-10-04] Unstable Footing's effect causes damage from all sources to be unpreventable,
//     not just damage from Unstable Footing itself.
//   [2004-10-04] If Unstable Footing is kicked and the targeted player is an illegal target by the
//     time it resolves, the entire spell doesn't resolve. Damage can still be prevented.
//
// The target is chosen only when kicked (the kicked variant's `targets`).

export default defineCard({
  name: "Unstable Footing",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Kicker {3}{R} (You may pay an additional {3}{R} as you cast this spell.)\nDamage can't be prevented this turn. If this spell was kicked, it deals 5 damage to target player or planeswalker.",
  effect: { kind: "damage-cant-be-prevented" },
  kicker: {
    cost: "{3}{R}",
    targets: ["player-or-planeswalker"],
    effect: {
      kind: "sequence",
      effects: [{ kind: "damage-cant-be-prevented" }, { kind: "damage", amount: 5, target: 0 }],
    },
  },
});
