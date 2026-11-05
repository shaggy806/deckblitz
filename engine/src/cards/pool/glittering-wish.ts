import { defineCard } from "../define.js";

export default defineCard({
  name: "Glittering Wish",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  exileOnResolve: true,
  text: "You may reveal a multicolored card you own from outside the game and put it into your hand. Exile Glittering Wish.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { multicolored: true },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    outside: "only",
  },
});
