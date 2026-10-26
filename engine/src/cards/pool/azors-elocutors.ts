import { defineCard } from "../define.js";

// EDHREC rank 8474.
//
// Rulings:
//   [2012-10-01] You'll only win the game if Azor's Elocutors has five or more filibuster counters
//     on it when the first ability resolves. For example, if Azor's Elocutors has four filibuster
//     counters on it and you somehow add another during your main phase, you won't win the game
//     immediately.
//   [2012-10-01] The second ability of Azor's Elocutors removes one filibuster counter per source,
//     no matter how much damage that source dealt. For example, if two attacking creatures deal
//     damage to you at the same time, two filibuster counters will be removed.
//
// The win check is a `conditional` inside the upkeep trigger's resolution (Waterbender
// Ascension's shape), so a counter added at another time wins nothing. "Whenever a source deals
// damage to you" is `deals-damage` with a recipient named: once per source per damage event,
// whatever the amount.

export default defineCard({
  name: "Azor's Elocutors",
  manaCost: "{3}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 5,
  text: "At the beginning of your upkeep, put a filibuster counter on this creature. Then if this creature has five or more filibuster counters on it, you win the game.\nWhenever a source deals damage to you, remove a filibuster counter from this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "filibuster", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "filibuster", compare: { op: "gte", n: 5 } },
            then: { kind: "win-game" },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, put a filibuster counter on this creature. Then if this creature has five or more filibuster counters on it, you win the game.",
    },
    {
      trigger: { on: "deals-damage", who: "any", to: "you" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "filibuster", amount: 1 },
      resolve: null,
      text: "Whenever a source deals damage to you, remove a filibuster counter from this creature.",
    },
  ],
});
