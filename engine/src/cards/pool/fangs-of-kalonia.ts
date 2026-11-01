import { defineCard } from "../define.js";

// "Each creature that had a +1/+1 counter put on it this way" is the
// resolution's `thisWay: "counters-put"` — only +1/+1 counters are put before
// it, so every one it names had one of those. Read before any is doubled.
export default defineCard({
  name: "Fangs of Kalonia",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control, then double the number of +1/+1 counters on each creature that had a +1/+1 counter put on it this way.\nOverload {4}{G}{G} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "double-counters-all", filter: { type: "creature", thisWay: "counters-put" }, counterKind: "+1/+1" },
    ],
  },
  overload: {
    cost: "{4}{G}{G}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
        { kind: "double-counters-all", filter: { type: "creature", thisWay: "counters-put" }, counterKind: "+1/+1" },
      ],
    },
  },
});
