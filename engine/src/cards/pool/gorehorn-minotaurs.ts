import { defineCard } from "../define.js";

// EDHREC rank 23122.
//
// Bloodthirst 2 (rule 702.54a): an enters-with-counters replacement, read as
// it enters, on whether any one opponent was dealt damage this turn.
const BLOODTHIRST =
  "Bloodthirst 2 (If an opponent was dealt damage this turn, this creature enters with two +1/+1 counters on it.)";

export default defineCard({
  name: "Gorehorn Minotaurs",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 3,
  toughness: 3,
  text: BLOODTHIRST,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 2,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST,
    },
  ],
});
