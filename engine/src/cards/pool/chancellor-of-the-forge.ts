import { defineCard } from "../define.js";

// EDHREC rank 13066.
//
// Rulings:
//   [2011-06-01] The number of creature tokens you put onto the battlefield with the last ability
//     is determined when the ability resolves. If Chancellor of the Forge is still on the
//     battlefield at that time, it will be counted.
//   [2021-03-19] A player’s “opening hand” is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player’s opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.

const REVEAL =
  "You may reveal this card from your opening hand. If you do, at the beginning of the first upkeep, create a 1/1 red Phyrexian Goblin creature token with haste.";
const ETB =
  "When this creature enters, create X 1/1 red Phyrexian Goblin creature tokens with haste, where X is the number of creatures you control.";

export default defineCard({
  name: "Chancellor of the Forge",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Giant"],
  power: 5,
  toughness: 5,
  text: `${REVEAL}\n${ETB}`,
  openingHandReveal: {
    at: "next-upkeep",
    effect: { kind: "create-token", token: "Phyrexian Goblin Token (Haste)", count: 1 },
    text: REVEAL,
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Phyrexian Goblin Token (Haste)",
        count: { countOf: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: ETB,
    },
  ],
});
