import { defineCard } from "../define.js";

// EDHREC rank 8748. Growing Rites of Itlimoc's look-and-choose, five cards
// deep, keeping a colorless card (a land with no mana cost is one — the ruling).

export default defineCard({
  name: "Ancient Stirrings",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top five cards of your library. You may reveal a colorless card from among them and put it into your hand. Then put the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { colorless: true },
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
