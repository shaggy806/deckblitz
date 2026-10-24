import { defineCard } from "../define.js";

// EDHREC rank 26529. Sleight of Hand's shape, with rebound.
export default defineCard({
  name: "Sight Beyond Sight",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  rebound: true,
  text:
    "Look at the top two cards of your library. Put one of them into your hand and the other on the bottom of your library.\n" +
    "Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 2,
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
