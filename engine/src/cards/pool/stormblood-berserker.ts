import { defineCard } from "../define.js";

// Bloodthirst 2 (rule 702.54a): "If an opponent was dealt damage this turn,
// this permanent enters with two +1/+1 counters on it" — an enters-with
// replacement whose amount reads the opponents' damage-taken stat.
export default defineCard({
  name: "Stormblood Berserker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: "Bloodthirst 2 (If an opponent was dealt damage this turn, this creature enters with two +1/+1 counters on it.)\nMenace (This creature can't be blocked except by two or more creatures.)",
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
      text: "Bloodthirst 2 (If an opponent was dealt damage this turn, this creature enters with two +1/+1 counters on it.)",
    },
  ],
});
