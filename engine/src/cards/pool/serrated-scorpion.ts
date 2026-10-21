import { defineCard } from "../define.js";

// EDHREC rank 8949. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] In a Two-Headed Giant game, Serrated Scorpion's ability causes the opposing team
//     to lose 4 life and you to gain 2 life.
//
// "It deals" — the creature that died is the source, as it last existed.

const DIES_TEXT = "When this creature dies, it deals 2 damage to each opponent and you gain 2 life.";

export default defineCard({
  name: "Serrated Scorpion",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Scorpion"],
  power: 1,
  toughness: 2,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
