import { defineCard } from "../define.js";

// EDHREC rank 7039.

export default defineCard({
  name: "Web of Life and Destiny",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nAt the beginning of combat on your turn, look at the top five cards of your library. You may put a creature card from among them onto the battlefield. Put the rest on the bottom of your library in a random order.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "bottom-random",
      },
      resolve: null,
      text: "At the beginning of combat on your turn, look at the top five cards of your library. You may put a creature card from among them onto the battlefield. Put the rest on the bottom of your library in a random order.",
    },
  ],
});
