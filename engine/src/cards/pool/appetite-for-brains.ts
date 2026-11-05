import { defineCard } from "../define.js";

// EDHREC rank 21528.
//
// Rulings:
//   If a card in a player's hand has {X} in its mana cost, X is considered to be 0.

export default defineCard({
  name: "Appetite for Brains",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a card from it with mana value 4 or greater and exile that card.",
  targets: ["opponent"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { manaValue: { op: "gte", n: 4 } },
    destination: "exile",
  },
});
