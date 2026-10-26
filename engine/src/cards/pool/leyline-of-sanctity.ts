import { defineCard } from "../define.js";

// EDHREC rank 7590.
//
// Rulings:
//   [2021-03-19] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.

export default defineCard({
  name: "Leyline of Sanctity",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: "If this card is in your opening hand, you may begin the game with it on the battlefield.\nYou have hexproof. (You can't be the target of spells or abilities your opponents control.)",
  static: [
    {
      affects: { scope: "self" },
      playerHexproof: true,
      text: "You have hexproof. (You can't be the target of spells or abilities your opponents control.)",
    },
  ],
});
