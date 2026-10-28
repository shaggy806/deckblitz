import { defineCard } from "../define.js";

// EDHREC rank 17335.
//
// Rulings:
//   [2021-03-19] A player’s “opening hand” is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player’s opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.
// The reveal is `openingHandReveal` (rule 103.6b): a delayed ability its owner
// controls, at the game's first upkeep, whoever's turn that is.

const REVEAL =
  "You may reveal this card from your opening hand. If you do, at the beginning of the first upkeep, each opponent loses 3 life, then you gain life equal to the life lost this way.";

export default defineCard({
  name: "Chancellor of the Dross",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Vampire"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "lifelink"],
  text: `${REVEAL}\nFlying, lifelink`,
  openingHandReveal: {
    at: "next-upkeep",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: 3, who: "each-opponent" },
        { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
      ],
    },
    text: REVEAL,
  },
});
