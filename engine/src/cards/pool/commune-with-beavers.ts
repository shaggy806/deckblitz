import { defineCard } from "../define.js";

// EDHREC rank 8287.

export default defineCard({
  name: "Commune with Beavers",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top three cards of your library. You may reveal an artifact, creature, or land card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { typesAnyOf: ["artifact", "creature", "land"] },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
