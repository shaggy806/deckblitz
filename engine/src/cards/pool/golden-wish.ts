import { defineCard } from "../define.js";

// EDHREC rank 30573.

export default defineCard({
  name: "Golden Wish",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You may reveal an artifact or enchantment card you own from outside the game and put it into your hand. Exile Golden Wish.",
  effect: {
    kind: "search-library",
    filter: { typesAnyOf: ["artifact", "enchantment"] },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    outside: "only",
  },
  exileOnResolve: true,
});
