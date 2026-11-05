import { defineCard } from "../define.js";

// EDHREC rank 28758.

export default defineCard({
  name: "Cunning Wish",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may reveal an instant card you own from outside the game and put it into your hand. Exile Cunning Wish.",
  effect: {
    kind: "search-library",
    filter: { type: "instant" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    outside: "only",
  },
  exileOnResolve: true,
});
