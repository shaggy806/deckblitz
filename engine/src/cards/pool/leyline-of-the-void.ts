import { defineCard } from "../define.js";

// EDHREC rank 3521.
//
// Rulings:
//   [2024-09-20] Tokens can still die while Leyline of the Void is on the battlefield.
//   [2024-09-20] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.
//   [2024-09-20] If your opponent discards a card while you control Leyline of the Void, abilities
//     that check whether a card is discarded (such as Hollow One, or a madness ability of the
//     discarded card) still work, even though that card never reaches that player's graveyard. In
//     addition, spells or abilities that check the characteristics of the discarded card can find
//     that card in exile.
//   [2024-09-20] While Leyline of the Void is on the battlefield, nontoken creatures your
//     opponents control won't die. They'll be exiled instead. Abilities that would trigger when
//     those creatures die won't trigger.

export default defineCard({
  name: "Leyline of the Void",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: "If this card is in your opening hand, you may begin the game with it on the battlefield.\nIf a card would be put into an opponent's graveyard from anywhere, exile it instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        // A card: a token isn't one, and still dies (the 2024 ruling).
        filter: { ownedBy: "opponent", token: false },
      },
      text: "If a card would be put into an opponent's graveyard from anywhere, exile it instead.",
    },
  ],
});
