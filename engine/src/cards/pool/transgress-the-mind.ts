import { defineCard } from "../define.js";

// EDHREC rank 25781. Devoid: no colors.
export default defineCard({
  name: "Transgress the Mind",
  manaCost: "{1}{B}",
  colors: [],
  types: ["sorcery"],
  text: "Devoid (This card has no color.)\nTarget player reveals their hand. You choose a card from it with mana value 3 or greater and exile that card.",
  targets: ["player"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { manaValue: { op: "gte", n: 3 } },
    destination: "exile",
  },
});
