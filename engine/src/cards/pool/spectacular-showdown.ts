import { defineCard } from "../define.js";

// "Each creature that had a double strike counter put on it this way" is the
// resolution's `thisWay: "counters-put"`: only double strike counters are put
// before it.
export default defineCard({
  name: "Spectacular Showdown",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Put a double strike counter on target creature, then goad each creature that had a double strike counter put on it this way. (Until your next turn, those creatures attack each combat if able and attack a player other than you if able.)\nOverload {4}{R}{R}{R} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "double-strike", amount: 1 },
      { kind: "goad", filter: { type: "creature", thisWay: "counters-put" } },
    ],
  },
  overload: {
    cost: "{4}{R}{R}{R}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "add-counter-all", filter: { type: "creature" }, counter: "double-strike", amount: 1 },
        { kind: "goad", filter: { type: "creature", thisWay: "counters-put" } },
      ],
    },
  },
});
