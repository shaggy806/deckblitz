import { defineCard } from "../define.js";

// EDHREC rank 27168.

export default defineCard({
  name: "Swaggering Corsair",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: "Raid — This creature enters with a +1/+1 counter on it if you attacked this turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { ifCondition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 }, then: 1, else: 0 },
        },
      },
      text: "Raid — This creature enters with a +1/+1 counter on it if you attacked this turn.",
    },
  ],
});
