import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 18365.

export default defineCard({
  name: "Hunt for Specimens",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Create a 1/1 black and green Pest creature token with \"When this token dies, you gain 1 life.\"\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [{ kind: "create-token", token: "Pest Token", count: 1 }, learn()],
  },
});
