import { defineCard } from "../define.js";

// EDHREC rank 19348.
//
// Bloodthirst 3 (rule 702.54a) is an entry replacement: three +1/+1 counters
// if an opponent was dealt damage this turn — the `damage-taken` turn stat of
// any one opponent, read as it enters.

const BLOODTHIRST =
  "Bloodthirst 3 (If an opponent was dealt damage this turn, this creature enters with three +1/+1 counters on it.)";

export default defineCard({
  name: "Carnage Wurm",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `${BLOODTHIRST}\nTrample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 3,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
  ],
});
