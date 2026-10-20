import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

export default defineCard({
  name: "Field Trip",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic Forest card, put that card onto the battlefield tapped, then shuffle.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", subtype: "Forest" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      learn(),
    ],
  },
});
