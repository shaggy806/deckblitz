import { defineCard } from "../define.js";

export default defineCard({
  name: "Commune with Nature",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top five cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
