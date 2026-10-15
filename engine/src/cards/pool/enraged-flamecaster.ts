import { defineCard } from "../define.js";

// EDHREC rank 14497.
//
// Rulings:
//   [2025-11-17] If a spell has {X} in its mana cost, use the value chosen for that X to determine
//     the mana value of that spell.

// The spell's mana value on the stack counts its chosen X (the ruling).
const CAST_TEXT =
  "Whenever you cast a spell with mana value 4 or greater, this creature deals 2 damage to each opponent.";

export default defineCard({
  name: "Enraged Flamecaster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Sorcerer"],
  power: 3,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
