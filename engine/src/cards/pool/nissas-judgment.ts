import { defineCard } from "../define.js";

// EDHREC rank 22631. Support first, so a creature given a counter deals damage
// too (the ruling); each creature is its own source.
export default defineCard({
  name: "Nissa's Judgment",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Support 2. (Put a +1/+1 counter on each of up to two target creatures.)\nChoose up to one target creature an opponent controls. Each creature you control with a +1/+1 counter on it deals damage equal to its power to that creature.",
  targets: [
    // An any-number group is always its list's last slot, so the victim comes first.
    { kind: "optional", of: "creature-an-opponent-controls" },
    { kind: "any-number", of: "creature", max: 2 },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 1, effect: { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 } },
      {
        kind: "each-deals-damage",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        amount: "its-power",
        to: 0,
      },
    ],
  },
});
