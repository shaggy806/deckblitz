import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// War of the Spark. EDHREC rank 12962.
//
// Allies at Last's shape: up to two creatures you control, then another
// target creature — any creature but those two. One of yours gone illegal,
// the other still deals its damage; the last target gone, nothing is dealt
// (its rulings — `fight` skips an illegal side).

export default defineCard({
  name: "Band Together",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Up to two target creatures you control each deal damage equal to their power to another target creature.",
  targets: [...distinctTargets(2, "creature-you-control", { optional: true }), { kind: "other", of: "creature", than: { slots: [0, 1] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "fight", a: 0, b: 2, oneSided: true },
      { kind: "fight", a: 1, b: 2, oneSided: true },
    ],
  },
});
