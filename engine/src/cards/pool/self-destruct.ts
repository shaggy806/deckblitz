import { defineCard } from "../define.js";

// EDHREC rank 6805.
//
// Rulings:
//   [2025-06-06] The value of X is calculated only once, as Self-Destruct resolves.
//   [2025-06-06] If the target creature you control is an illegal target as Self-Destruct tries to
//     resolve, the creature you control won't deal damage. If the creature you control is a legal
//     target but the other target isn't, your creature will still deal damage to itself.

// One instruction (a `simultaneous` sequence): one damage event, the creature
// the source of both (`from`). Its slot blank, it deals neither; the other
// slot blank, it still deals the damage to itself (the rulings).
export default defineCard({
  name: "Self-Destruct",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control deals X damage to any other target and X damage to itself, where X is its power.",
  targets: ["creature-you-control", { kind: "other", of: "any-target", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: { powerOf: 0 }, target: 1, from: { target: 0 } },
      { kind: "damage", amount: { powerOf: 0 }, target: 0, from: { target: 0 } },
    ],
  },
});
