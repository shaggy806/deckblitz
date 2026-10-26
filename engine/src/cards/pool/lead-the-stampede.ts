import { defineCard } from "../define.js";

export default defineCard({
  name: "Lead the Stampede",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top five cards of your library. You may reveal any number of creature cards from among them and put the revealed cards into your hand. Put the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 5,
    filter: { type: "creature" },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
