import { defineCard } from "../define.js";

// EDHREC rank 21347.
//
// Rulings:
//   [2025-04-04] You compare Formation Breaker’s power to the power of any creature trying to
//     block it only as blockers are declared. Once Formation Breaker has been legally blocked by a
//     creature, changing the power of either creature won’t change or undo the block.

const BLOCK_TEXT = "Creatures with power less than this creature's power can't block it.";
const PUMP_TEXT = "As long as you control a creature with a counter on it, this creature gets +1/+2.";

export default defineCard({
  name: "Formation Breaker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 1,
  text: `${BLOCK_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: BLOCK_TEXT,
    },
    {
      affects: { scope: "self" },
      // "A creature" — this one too, when it has a counter (`countsSelf`);
      // a bare "with a counter on it" is a counter of any kind.
      condition: {
        kind: "controls",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
        atLeast: 1,
        countsSelf: true,
      },
      grantPt: [1, 2],
      text: PUMP_TEXT,
    },
  ],
});
