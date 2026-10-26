import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 17519.
//
// Rulings:
//   [2006-02-01] Leyline of the Meek gives a bonus to creatures only if they're tokens. Cards such
//     as Clone that are copying tokens aren't tokens.
//   [2021-03-19] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.

const TEXT = "Creature tokens get +1/+1.";

export default defineCard({
  name: "Leyline of the Meek",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: `If this card is in your opening hand, you may begin the game with it on the battlefield.\n${TEXT}`,
  static: [{ affects: { scope: "filter", filter: { type: "creature", token: true } }, grantPt: [1, 1], text: TEXT }],
});
