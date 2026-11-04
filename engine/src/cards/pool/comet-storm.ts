import { defineCard } from "../define.js";

// EDHREC rank 1447.
//
// The kicks and X are announced, then one target plus one a kick, all different
// (the rulings), and they're fixed from there: a target gone by resolution
// leaves the damage to the rest.
const TIMES = { sum: [{ timesKicked: "source" }, 1] } as const;

export default defineCard({
  name: "Comet Storm",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Multikicker {1} (You may pay an additional {1} any number of times as you cast this spell.)\n" +
    "Choose any target, then choose another target for each time this spell was kicked. Comet Storm deals X damage to each of them.",
  kicker: { cost: "{1}", multi: true },
  targets: [{ kind: "any-number", of: "any-target", min: TIMES, max: TIMES }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "damage", amount: "x", target: 0 },
  },
});
