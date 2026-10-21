import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] Because Frantic Inventory is still on the stack while it's resolving, it doesn't
//     count towards the number of cards you draw.

export default defineCard({
  name: "Frantic Inventory",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw a card, then draw cards equal to the number of cards named Frantic Inventory in your graveyard.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "draw", amount: { countInGraveyard: { name: "Frantic Inventory", ownedBy: "you" } } },
    ],
  },
});
