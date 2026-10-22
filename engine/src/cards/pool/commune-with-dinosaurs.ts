import { defineCard } from "../define.js";

// EDHREC rank 10097. Ixalan. Adventurous Impulse's shape over five cards,
// with "a Dinosaur or land card" as an `anyOf`.

export default defineCard({
  name: "Commune with Dinosaurs",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top five cards of your library. You may reveal a Dinosaur or land card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { anyOf: [{ subtype: "Dinosaur" }, { type: "land" }] },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
