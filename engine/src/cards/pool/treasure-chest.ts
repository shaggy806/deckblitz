import { defineCard } from "../define.js";

// EDHREC rank 4904.
//
// Rulings:
//   [2021-07-23] The instruction to roll a die and the effect that occurs because of the result
//     are all part of the same ability.
//   [2021-07-23] If you choose to put the card into your hand, you don't need to reveal it.
//   [2021-07-23] The "otherwise" in the last ability refers to whether or not you put it onto the
//     battlefield, not whether or not it's an artifact card. You may put it into your hand even if
//     it's an artifact card.
//
// The 20 row's find goes onto the battlefield only if it's an artifact card
// and the searcher chooses so (`instead`, `pick: "any"`), into the hand
// otherwise.
const TEXT =
  "{4}, Sacrifice this artifact: Roll a d20.\n1 | Trapped! — You lose 3 life.\n2—9 | Create five Treasure tokens.\n10—19 | You gain 3 life and draw three cards.\n20 | Search your library for a card. If it's an artifact card, you may put it onto the battlefield. Otherwise, put that card into your hand. Then shuffle.";

export default defineCard({
  name: "Treasure Chest",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 1, effect: { kind: "lose-life", amount: 3 } },
          { min: 2, max: 9, effect: { kind: "create-token", token: "Treasure Token", count: 5 } },
          {
            min: 10,
            max: 19,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "gain-life", amount: 3 },
                { kind: "draw", amount: 3 },
              ],
            },
          },
          {
            min: 20,
            max: 20,
            effect: {
              kind: "search-library",
              filter: {},
              destination: "hand",
              min: 1,
              max: 1,
              instead: { destination: "battlefield", filter: { type: "artifact" }, pick: "any" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
