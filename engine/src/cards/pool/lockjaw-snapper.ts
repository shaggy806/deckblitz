import { defineCard } from "../define.js";

// EDHREC rank 16099.
//
// Rulings:
//   [2008-05-01] Each of those creatures will get just one new -1/-1 counter, regardless of how
//     many it already has.

export default defineCard({
  name: "Lockjaw Snapper",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 2,
  keywords: ["wither"],
  text: "Wither (This deals damage to creatures in the form of -1/-1 counters.)\nWhen this creature dies, put a -1/-1 counter on each creature with a -1/-1 counter on it.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", counters: { kind: "-1/-1", compare: { op: "gte", n: 1 } } },
        counter: "-1/-1",
        amount: 1,
      },
      resolve: null,
      text: "When this creature dies, put a -1/-1 counter on each creature with a -1/-1 counter on it.",
    },
  ],
});
