import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 29551. Throw a Line's distribution: one
// target takes both counters, two take one each.

export default defineCard({
  name: "Elven Rite",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Distribute two +1/+1 counters among one or two target creatures.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target-chosen", index: 1 },
    then: {
      kind: "sequence",
      effects: [
        { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
      ],
    },
    else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
  },
});
