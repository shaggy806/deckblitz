import { defineCard } from "../define.js";

// EDHREC rank 13265.
//
// Rulings:
//   [2021-03-19] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.
//
// "Creature spells" are every player's (Lier's `allSpells`), matched on the stack.
const LEYLINE_TEXT = "If this card is in your opening hand, you may begin the game with it on the battlefield.";
const COUNTER_TEXT = "Creature spells can't be countered.";

export default defineCard({
  name: "Leyline of Lifeforce",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: `${LEYLINE_TEXT}\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "creature" }, cantBeCountered: true, allSpells: true },
      text: COUNTER_TEXT,
    },
  ],
});
