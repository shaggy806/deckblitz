import { defineCard } from "../define.js";

// EDHREC rank 4805.
//
// Rulings:
//   [2020-04-17] If you choose the second mode for Heartless Act, you choose which counters to
//     remove from the creature, no matter who controls the creature. You may choose counters of
//     different kinds.
//   [2020-04-17] If you choose the first mode and the creature gains a counter in response, you
//     can't remove counters from it instead; the spell just doesn't resolve. Similarly, if you
//     choose the second mode and the creature loses its counters in response, you can't destroy it
//     instead.
//
// "With no counters on it" is the first mode's target restriction, checked
// again as it resolves (rule 608.2b); the second mode's counters are the
// caster's choice of kinds (`remove-counters`, `counter: "any"`).

export default defineCard({
  name: "Heartless Act",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target creature with no counters on it.\n• Remove up to three counters from target creature.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target creature with no counters on it.",
        targets: [{ kind: "permanent", filter: { type: "creature", counters: { compare: { op: "eq", n: 0 } } } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Remove up to three counters from target creature.",
        targets: ["creature"],
        effect: { kind: "remove-counters", target: 0, counter: "any", count: 3, upTo: true },
      },
    ],
  },
});
