import { defineCard } from "../define.js";

// EDHREC rank 27361.
//
// Rulings:
//   [2020-06-23] Once Tome Anima has become blocked, it won't become unblocked if you draw a
//     second card.

export default defineCard({
  name: "Tome Anima",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: "This creature can't be blocked as long as you've drawn two or more cards this turn.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked as long as you've drawn two or more cards this turn.",
    },
  ],
});
