import { defineCard } from "../define.js";

// EDHREC rank 17613.
//
// Rulings:
//   [2026-06-29] Ravening Warg's triggered ability will check when it attacks to see if you
//     control a creature with power 4 or greater. If you don't, the ability won't trigger at all.
//     It will not check again when it resolves, so the ability will resolve even if you no longer
//     control a creature with power 4 or greater.

export default defineCard({
  name: "Ravening Warg",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: "Deathtouch\nFerocious — Whenever this creature attacks while you control a creature with power 4 or greater, you gain 2 life.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "controls",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
        atLeast: 1,
      },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "Ferocious — Whenever this creature attacks while you control a creature with power 4 or greater, you gain 2 life.",
    },
  ],
});
