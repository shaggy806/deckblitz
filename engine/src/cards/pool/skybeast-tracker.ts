import { defineCard } from "../define.js";

// EDHREC rank 22941.
//
// Rulings:
//   [2023-09-01] If a spell has {X} in its mana cost, use the value chosen for that X to determine
//     the mana value of that spell.

const TEXT =
  "Whenever you cast a spell with mana value 5 or greater, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";

export default defineCard({
  name: "Skybeast Tracker",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Archer"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 5 } } },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
