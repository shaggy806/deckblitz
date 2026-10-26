import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 9446. Thrill of Possibility's shape.
//
// Rulings:
//   [2012-07-01] Because discarding a card is an additional cost, you can’t cast Wild Guess if you
//     have no other cards in hand.

export default defineCard({
  name: "Wild Guess",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard a card.\nDraw two cards.",
  additionalCost: { discard: 1 },
  effect: { kind: "draw", amount: 2 },
});
