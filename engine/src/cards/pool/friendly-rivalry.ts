import { defineCard } from "../define.js";

// EDHREC rank 10707.
//
// Rulings:
//   [2023-06-16] If one of the two target creatures you control is an illegal target as Friendly
//     Rivalry resolves, the other will still deal damage equal to its power.
//   [2023-06-16] If the last target is an illegal target as Friendly Rivalry resolves, or if both
//     of the first targets are illegal targets, no creature deals or is dealt damage.
//
// Graceful Takedown's shape: slot 0 is the creature you control, slot 1 the
// creature you don't control, and slot 2 the "up to one other target
// legendary creature you control" (other than slot 0). Both hits are
// one-sided fights dealt at once (one damage event); an empty or illegal slot
// deals nothing.

const TEXT =
  "Target creature you control and up to one other target legendary creature you control each deal damage equal to their power to target creature you don't control.";

export default defineCard({
  name: "Friendly Rivalry",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: TEXT,
  targets: [
    "creature-you-control",
    "creature-an-opponent-controls",
    {
      kind: "optional",
      of: {
        kind: "other",
        of: { kind: "permanent", whose: "you", filter: { type: "creature", supertype: "legendary" } },
        than: { slot: 0 },
      },
    },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "fight", a: 0, b: 1, oneSided: true },
      { kind: "fight", a: 2, b: 1, oneSided: true },
    ],
  },
});
