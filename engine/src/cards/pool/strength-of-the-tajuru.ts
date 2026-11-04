import { defineCard } from "../define.js";

// EDHREC rank 13149. Comet Storm's shape: one target plus one for each kick, all
// different.
const TIMES = { sum: [{ timesKicked: "source" }, 1] } as const;

export default defineCard({
  name: "Strength of the Tajuru",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text:
    "Multikicker {1} (You may pay an additional {1} any number of times as you cast this spell.)\n" +
    "Choose target creature, then choose another target creature for each time this spell was kicked. Put X +1/+1 counters on each of them.",
  kicker: { cost: "{1}", multi: true },
  targets: [{ kind: "any-number", of: "creature", min: TIMES, max: TIMES }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
  },
});
