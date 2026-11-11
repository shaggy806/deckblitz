import { defineCard } from "../define.js";

// EDHREC rank 6175.
//
// Rulings:
//   [2025-04-04] If a creature on the battlefield or a creature card in a graveyard has {X} in its
//     mana cost, X is 0 for the purpose of determining its mana value.
//
// X is announced as the ability is activated (rules 602.2b, 601.2b), the
// target chosen at that X plus 1 (601.2c), then a creature with mana value X
// sacrificed (601.2h): the sacrifice's filter reads X.
const TEXT =
  "{T}, Sacrifice a creature you control with mana value X other than Sidisi: Return target creature card with mana value X plus 1 from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Sidisi, Regent of the Mire",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Snake", "Warlock"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: { filter: { type: "creature", manaValue: { op: "eq", n: "x" } } },
      },
      otherOnly: true,
      sorcerySpeed: true,
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "eq", n: { amount: { sum: ["x", 1] } } } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
