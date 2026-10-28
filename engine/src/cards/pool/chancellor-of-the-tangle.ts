import { defineCard } from "../define.js";

// EDHREC rank 15684.
//
// Rulings:
//   [2021-03-19] A player’s “opening hand” is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player’s opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.
// "Your first main phase of the game": `your-next-main-phase` made before turn
// 1 fires at the precombat main phase of its owner's first turn.

const REVEAL =
  "You may reveal this card from your opening hand. If you do, at the beginning of your first main phase of the game, add {G}.";

export default defineCard({
  name: "Chancellor of the Tangle",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 6,
  toughness: 7,
  keywords: ["reach", "vigilance"],
  text: `${REVEAL}\nReach, vigilance`,
  openingHandReveal: {
    at: "your-next-main-phase",
    effect: { kind: "add-mana", mana: "G", amount: 1 },
    text: REVEAL,
  },
});
