import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 25421.

export default defineCard({
  name: "Cram Session",
  manaCost: "{1}{B/G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "You gain 4 life.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 4 },
      learn(),
    ],
  },
});
