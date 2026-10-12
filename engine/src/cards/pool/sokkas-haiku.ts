import { defineCard } from "../define.js";

// EDHREC rank 8351.
//
// Rulings:
//   [2025-10-02] A haiku has five syllables in the first and third lines and seven in the second
//     line.

export default defineCard({
  name: "Sokka's Haiku",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "Counter target spell.\nDraw a card, then mill three cards.\nUntap target land.",
  targets: ["spell", "land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "draw", amount: 1 },
      { kind: "mill", target: "you", amount: 3 },
      { kind: "untap", target: 1 },
    ],
  },
});
