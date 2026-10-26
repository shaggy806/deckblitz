import { defineCard } from "../define.js";

// EDHREC rank 15979. Vine Snare's shape: `by` is asked of each source as its
// damage would be dealt, which is the ruling.
//
// Rulings:
//   [2013-01-24] Hindervines checks whether a creature has a +1/+1 counter on it at the moment it
//     deals damage. It doesn't matter whether a creature had a +1/+1 counter, or was even on the
//     battlefield, when Hindervines resolved.

export default defineCard({
  name: "Hindervines",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn by creatures with no +1/+1 counters on them.",
  targets: [],
  effect: {
    kind: "prevent-all-combat-damage",
    by: { type: "creature", counters: { kind: "+1/+1", compare: { op: "eq", n: 0 } } },
  },
});
