import { defineCard } from "../define.js";

// EDHREC rank 8033.
//
// Rulings:
//   [2023-11-10] Populate doesn't target the creature token you're copying. You choose that
//     creature token as you're taking the populate action.
//   [2023-11-10] If you control no creature tokens when you populate, nothing will happen.

const TEXT =
  "Whenever a nontoken creature you control with power 4 or greater enters, populate. (Create a token that's a copy of a creature token you control.)";

export default defineCard({
  name: "Life Finds a Way",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", token: false, power: { op: "gte", n: 4 } },
      },
      targets: [],
      effect: { kind: "populate" },
      resolve: null,
      text: TEXT,
    },
  ],
});
