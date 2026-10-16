import { defineCard } from "../define.js";

// EDHREC rank 10710.
//
// Rulings:
//   [2024-09-20] If the target of Fear of Lost Teeth's ability is an illegal target as the ability
//     tries to resolve, it won't resolve and none of its effects will happen. You won't gain life.
//
// One targeted ability: an illegal target fizzles the whole of it, the life
// gain included.
const DIES = "When this creature dies, it deals 1 damage to any target and you gain 1 life.";

export default defineCard({
  name: "Fear of Lost Teeth",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 1,
  toughness: 1,
  text: DIES,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
