import { defineCard } from "../define.js";

// EDHREC rank 13676.
//
// Rulings:
//   [2022-12-08] The enchanted creature is the source of both the damage ability and the resulting
//     damage, not Quicksilver Dagger.
//
// Molting Snakeskin's shape: the granted ability is the creature's own, so it
// deals the damage and its controller ("you") draws.

const GRANTED_TEXT = "{T}: This creature deals 1 damage to target player or planeswalker. You draw a card.";
const STATIC_TEXT = `Enchanted creature has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Quicksilver Dagger",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["player-or-planeswalker"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "damage", amount: 1, target: 0 },
              { kind: "draw", amount: 1 },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
