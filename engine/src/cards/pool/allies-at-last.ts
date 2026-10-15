import { defineCard } from "../define.js";
import { affinity, distinctTargets } from "../helpers.js";

// EDHREC rank 10682. "Up to two target creatures you control" is one "target"
// over two optional slots (two different creatures); each deals damage equal
// to its power to the last target (Giantfall's one-sided fight), in one
// instruction — one damage event. An empty or illegal slot deals nothing, and
// the other still deals its damage; with the last target illegal, nothing is
// dealt (Band Together's rulings, the same text).
export default defineCard({
  name: "Allies at Last",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Affinity for Allies (This spell costs {1} less to cast for each Ally you control.)\nUp to two target creatures you control each deal damage equal to their power to target creature an opponent controls.",
  selfCostReduction: affinity({ subtype: "Ally" }),
  targets: [...distinctTargets(2, "creature-you-control", { optional: true }), "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "fight", a: 0, b: 2, oneSided: true },
      { kind: "fight", a: 1, b: 2, oneSided: true },
    ],
  },
});
