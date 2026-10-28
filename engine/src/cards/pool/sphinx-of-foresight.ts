import { defineCard } from "../define.js";

// EDHREC rank 9161.
//
// Rulings:
//   [2019-01-25] If you reveal two Sphinxes of Foresight from your opening hand, you'll scry 3
//     twice; you won't scry 6. Any cards you put on top of your library the first time you scry 3
//     will be part of the second time you scry 3.
//   [2021-03-19] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.
// Two revealed scry 3 twice, not 6 (the ruling): one delayed ability each.

const REVEAL =
  "You may reveal this card from your opening hand. If you do, scry 3 at the beginning of your first upkeep.";

export default defineCard({
  name: "Sphinx of Foresight",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `${REVEAL}\nFlying\nAt the beginning of your upkeep, scry 1.`,
  openingHandReveal: {
    at: "your-next-upkeep",
    effect: { kind: "scry", amount: 3 },
    text: REVEAL,
  },
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, scry 1.",
    },
  ],
});
