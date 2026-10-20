import { defineCard } from "../define.js";

// EDHREC rank 21019.
//
// Rulings:
//   [2021-09-24] The triggered ability adds {R}{R}{R} if any opponent lost any amount of life this
//     turn, even if they also gained life at some point.
//
// Flamecache Gecko's shape: the intervening "if" is a `turn-stat` condition.

const ENTERS_TEXT = "When this creature enters, if an opponent lost life this turn, add {R}{R}{R}.";

export default defineCard({
  name: "Famished Foragers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 3,
  text: `${ENTERS_TEXT}\n{2}{R}, Discard a card: Draw a card.`,
  triggered: [
    {
      resolve: null,
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 3 },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      resolve: null,
      cost: { mana: "{2}{R}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      text: "{2}{R}, Discard a card: Draw a card.",
    },
  ],
});
