import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 24257.

export default defineCard({
  name: "Gnarled Professor",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
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
