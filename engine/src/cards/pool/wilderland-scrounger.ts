import { defineCard } from "../define.js";

// EDHREC rank 14944.
//
// Rulings:
//   [2026-06-29] Wilderland Scrounger's triggered ability will check when it attacks to see if you
//     control a creature with power 4 or greater. If you don't, the ability won't trigger at all.
//     It will not check again when it resolves, so the trigger will resolve even if you no longer
//     control a creature with power 4 or greater.
// "While" is checked as it triggers only (`whileCondition`), not on resolution — the ruling.

const TEXT =
  "Ferocious — Whenever this creature attacks while you control a creature with power 4 or greater, put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Wilderland Scrounger",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "controls",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
        atLeast: 1,
      },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
