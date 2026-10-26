import { defineCard } from "../define.js";

// EDHREC rank 21954.
//
// Rulings:
//   Forge Devil's ability is mandatory. If it's the only creature on the battlefield, you'll have
//     to choose it as the target and have it deal 1 damage to itself and 1 damage to you.

const TEXT = "When this creature enters, it deals 1 damage to target creature and 1 damage to you.";

export default defineCard({
  name: "Forge Devil",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
