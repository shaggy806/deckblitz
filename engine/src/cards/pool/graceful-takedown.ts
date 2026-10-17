import { defineCard } from "../define.js";

// EDHREC rank 24396.
//
// Rulings:
//   [2023-09-01] If one of the target creatures you control is an illegal target as Graceful
//     Takedown resolves (perhaps because it's no longer enchanted or is no longer on the
//     battlefield), the remaining legal target creatures you control will still deal damage equal
//     to their power.
//   [2023-09-01] If the last target creature is an illegal target as Graceful Takedown resolves,
//     or if all of the target creatures you control are illegal targets, no creature deals or is
//     dealt damage.
//
// Slot 0 is "up to one other target creature you control", slot 1 the
// creature you don't control, and the "any number of target enchanted
// creatures you control" group sits last (it must), each member other than
// slot 0 — the same "other" relation read the other way round. Every hit is
// a one-sided fight dealt at once (one damage event).

const TEXT =
  "Any number of target enchanted creatures you control and up to one other target creature you control each deal damage equal to their power to target creature you don't control.";

export default defineCard({
  name: "Graceful Takedown",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    { kind: "optional", of: "creature-you-control" },
    "creature-an-opponent-controls",
    {
      kind: "any-number",
      of: {
        kind: "other",
        of: { kind: "permanent", whose: "you", filter: { type: "creature", enchanted: true } },
        than: { slot: 0 },
      },
    },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "fight", a: 0, b: 1, oneSided: true },
      {
        kind: "for-each-target",
        from: 2,
        simultaneous: true,
        effect: { kind: "fight", a: 2, b: 1, oneSided: true },
      },
    ],
  },
});
