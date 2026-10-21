import { defineCard } from "../define.js";

// EDHREC rank 8496.

export default defineCard({
  name: "Adventurous Impulse",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top three cards of your library. You may reveal a creature or land card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { typesAnyOf: ["creature", "land"] },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
