import { defineCard } from "../define.js";

// EDHREC rank 18450. Adventurous Impulse's shape, four deep.

export default defineCard({
  name: "Seek the Wilds",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top four cards of your library. You may reveal a creature or land card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { typesAnyOf: ["creature", "land"] },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
