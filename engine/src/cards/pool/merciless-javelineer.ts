import { defineCard } from "../define.js";

// Amonkhet. The creature can't block even if the counter can't be put on it
// (the ruling): two independent effects on one target.
const TEXT = "{2}, Discard a card: Put a -1/-1 counter on target creature. That creature can't block this turn.";

export default defineCard({
  name: "Merciless Javelineer",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 4,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, discard: { count: 1 } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
