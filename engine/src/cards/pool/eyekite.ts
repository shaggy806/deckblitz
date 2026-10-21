import { defineCard } from "../define.js";

// EDHREC rank 26737.
//
// Rulings:
//   If a spell or ability causes you to put cards into your hand without specifically using the
//     word "draw," Eyekite's effect doesn't count them.
//   Eyekite's effect applies even if you drew two or more cards only before Eyekite entered the
//     battlefield.
// Messenger Hawk's static.

const TEXT = "This creature gets +2/+0 as long as you've drawn two or more cards this turn.";

export default defineCard({
  name: "Eyekite",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      grantPt: [2, 0],
      text: TEXT,
    },
  ],
});
