import { defineCard } from "../define.js";

// EDHREC rank 16188.
//
// Rulings:
//   [2025-04-04] Delta Bloodflies's last ability checks at the moment it would trigger to see if
//     you control a creature with a counter on it. If you don't, the ability won't trigger at all.
//     If it does trigger, the ability will check again as it tries to resolve. If you don't
//     control a creature with a counter on it at that time, the ability won't resolve and none of
//     its effects will happen.

const ATTACK_TEXT =
  "Whenever this creature attacks, if you control a creature with a counter on it, each opponent loses 1 life.";

export default defineCard({
  name: "Delta Bloodflies",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      // The intervening-if (rule 603.4); this creature counts.
      condition: {
        kind: "controls",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
        atLeast: 1,
      },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
