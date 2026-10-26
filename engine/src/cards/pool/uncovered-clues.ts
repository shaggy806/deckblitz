import { defineCard } from "../define.js";

// EDHREC rank 23887.

export default defineCard({
  name: "Uncovered Clues",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top four cards of your library. You may reveal up to two instant and/or sorcery cards from among them and put the revealed cards into your hand. Put the rest on the bottom of your library in any order.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: "chosen",
    min: 0,
    max: 2,
    filter: { typesAnyOf: ["instant", "sorcery"] },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
