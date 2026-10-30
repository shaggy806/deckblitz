import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 26300.

export default defineCard({
  name: "Professor of Symbology",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: learn(),
      resolve: null,
      text: "When this creature enters, learn.",
    },
  ],
});
