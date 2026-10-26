import { defineCard } from "../define.js";

// EDHREC rank 11329.
//
// Rulings:
//   [2010-08-15] If Leyline of Vitality and a creature enter under your control at the same time,
//     Leyline of Vitality's third ability will trigger.
//   [2021-03-19] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.

export default defineCard({
  name: "Leyline of Vitality",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: "If this card is in your opening hand, you may begin the game with it on the battlefield.\nCreatures you control get +0/+1.\nWhenever a creature you control enters, you may gain 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: "Whenever a creature you control enters, you may gain 1 life.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [0, 1],
      text: "Creatures you control get +0/+1.",
    },
  ],
});
