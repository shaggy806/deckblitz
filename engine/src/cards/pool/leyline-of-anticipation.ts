import { defineCard } from "../define.js";

// EDHREC rank 751.
//
// Rulings:
//   [2021-03-19] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.

export default defineCard({
  name: "Leyline of Anticipation",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: "If this card is in your opening hand, you may begin the game with it on the battlefield.\nYou may cast spells as though they had flash.",
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: true,
      text: "You may cast spells as though they had flash.",
    },
  ],
});
