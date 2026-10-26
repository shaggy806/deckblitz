import { defineCard } from "../define.js";

// EDHREC rank 18669.
//
// Bloodthirst 6 (rule 702.54a) is an entry replacement: six +1/+1 counters if
// an opponent was dealt damage this turn — the `damage-taken` turn stat of any
// one opponent, read as it enters.

const BLOODTHIRST =
  "Bloodthirst 6 (If an opponent was dealt damage this turn, this creature enters with six +1/+1 counters on it.)";

export default defineCard({
  name: "Furyborn Hellkite",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `${BLOODTHIRST}\nFlying`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 6,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
  ],
});
