import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 15806.

export default defineCard({
  name: "Eyetwitch",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Eye", "Bat"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: learn(),
      resolve: null,
      text: "When this creature dies, learn.",
    },
  ],
});
