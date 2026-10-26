import { defineCard } from "../define.js";

// EDHREC rank 20911.
//
// Bloodthirst 1 (rule 702.54a): an enters-with-counters replacement, read as
// it enters, on whether any one opponent was dealt damage this turn.
const BLOODTHIRST =
  "Bloodthirst 1 (If an opponent was dealt damage this turn, this creature enters with a +1/+1 counter on it.)";

export default defineCard({
  name: "Duskhunter Bat",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 1,
  toughness: 1,
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
            then: 1,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
  ],
});
