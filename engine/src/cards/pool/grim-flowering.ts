import { defineCard } from "../define.js";

// EDHREC rank 20629.
//
// Rulings:
//   [2011-01-22] Count the number of creature cards in your graveyard when Grim Flowering
//     resolves.

export default defineCard({
  name: "Grim Flowering",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Draw a card for each creature card in your graveyard.",
  effect: { kind: "draw", amount: { countInGraveyard: { type: "creature", ownedBy: "you" } } },
});
