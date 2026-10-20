import { defineCard } from "../define.js";

// EDHREC rank 16567. The reveal stops at a creature card whose mana value
// equals the roll (an `{ amount }` compare, bound as the reveal applies).
//
// Rulings:
//   [2021-07-23] Even if you reveal the entire library this way, putting it on the bottom in a
//     random order doesn't count as “shuffling” the library.
//   [2021-07-23] If you do not have a creature card in your library with mana value equal to the
//     result, you will reveal your entire library and then put the entire library back in a random
//     order.

const TEXT =
  "{4}{G}, {T}: Roll a d8. Reveal cards from the top of your library until you reveal a creature card with mana value equal to the result. Put that card onto the battlefield and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Bag of Tricks",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}{G}", tap: true },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 8,
        then: {
          kind: "reveal-until",
          filter: { type: "creature", manaValue: { op: "eq", n: { amount: { roll: "total" } } } },
          put: "battlefield",
          rest: "bottom-random",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
