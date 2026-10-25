import { defineCard } from "../define.js";

// EDHREC rank 22947.
//
// Rulings:
//   - It cares only about the spell's mana value, not how much mana was paid:
//     cost reductions such as emerge's don't change whether it triggers.

export default defineCard({
  name: "Emrakul's Influence",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever you cast an Eldrazi creature spell with mana value 7 or greater, draw two cards.",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "creature", subtype: "Eldrazi", manaValue: { op: "gte", n: 7 } },
      },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "Whenever you cast an Eldrazi creature spell with mana value 7 or greater, draw two cards.",
    },
  ],
});
