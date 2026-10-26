import { defineCard } from "../define.js";

// EDHREC rank 28510.
//
// Garruk, Caller of Beasts' "+1" shape: min = max = the cards revealed, so
// every matching card goes to hand and the rest to the bottom in any order.

export default defineCard({
  name: "Lair Delve",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top two cards of your library. Put all creature and land cards revealed this way into your hand and the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 2,
    reveal: true,
    min: 2,
    max: 2,
    filter: { typesAnyOf: ["creature", "land"] },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
