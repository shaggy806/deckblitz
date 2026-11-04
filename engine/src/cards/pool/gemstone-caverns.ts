import { defineCard } from "../define.js";

// EDHREC rank 181.
//
// Rulings:
//   [2021-03-19] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.
//   [2021-03-19] If multiple Gemstone Caverns are put onto the battlefield under a single player's
//     control before the game begins, the "legend rule" won't put the extras into that player's
//     graveyard until just before the starting player gets priority during the game's first upkeep
//     step. There's no opportunity to tap the extras for mana.

const OPENING =
  "If this card is in your opening hand and you're not the starting player, you may begin the game with Gemstone Caverns on the battlefield with a luck counter on it. If you do, exile a card from your hand.";
const MANA = "{T}: Add {C}. If Gemstone Caverns has a luck counter on it, instead add one mana of any color.";

export default defineCard({
  name: "Gemstone Caverns",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `${OPENING}\n${MANA}`,
  beginsOnBattlefield: {
    notStartingPlayer: true,
    counters: [{ kind: "luck", amount: 1 }],
    thenExileFromHand: 1,
  },
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: {
          ifCondition: { kind: "self-counters", counter: "luck", compare: { op: "gte", n: 1 } },
          thenOneOf: ["W", "U", "B", "R", "G"],
          elseOneOf: ["C"],
        },
        amount: 1,
      },
      resolve: null,
      text: MANA,
    },
  ],
});
