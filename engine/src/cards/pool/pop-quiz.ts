import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 25122.

export default defineCard({
  name: "Pop Quiz",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw a card.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      learn(),
    ],
  },
});
