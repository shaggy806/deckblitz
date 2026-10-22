import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

// Rulings:
//   [2017-07-14] A creature with a -1/-1 counter on it controlled by any player satisfies
//     Tenacious Hunter's ability.
//   [2017-07-14] If Tenacious Hunter loses vigilance after attacking, it will remain untapped.
// "A creature" is any player's: yours (itself included) or some opponent's.

const WITH_COUNTER: CardFilter = { type: "creature", counters: { kind: "-1/-1", compare: { op: "gte", n: 1 } } };

export default defineCard({
  name: "Tenacious Hunter",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Crocodile"],
  power: 4,
  toughness: 4,
  text: "As long as a creature has a -1/-1 counter on it, this creature has vigilance and deathtouch.",
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: WITH_COUNTER, atLeast: 1 },
          { kind: "opponent-controls", filter: WITH_COUNTER, atLeast: 1 },
        ],
      },
      grantKeywords: ["vigilance", "deathtouch"],
      text: "As long as a creature has a -1/-1 counter on it, this creature has vigilance and deathtouch.",
    },
  ],
});
