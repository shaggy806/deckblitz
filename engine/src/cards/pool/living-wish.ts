import { defineCard } from "../define.js";

// EDHREC rank 28516. Judgment. Burning Wish's shape, for a creature or land.

export default defineCard({
  name: "Living Wish",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You may reveal a creature or land card you own from outside the game and put it into your hand. Exile Living Wish.",
  effect: {
    kind: "search-library",
    filter: { typesAnyOf: ["creature", "land"] },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    outside: "only",
  },
  exileOnResolve: true,
});
