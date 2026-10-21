import { defineCard } from "../define.js";

// Theros Beyond Death. Wavebreak Hippocamp's "your first spell during each
// opponent's turn".

const TEXT = "Whenever you cast your first spell during each opponent's turn, this creature deals 1 damage to any target.";

export default defineCard({
  name: "Dreamstalker Manticore",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Manticore"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
