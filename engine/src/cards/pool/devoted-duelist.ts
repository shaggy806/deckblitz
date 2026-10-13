import { defineCard } from "../define.js";

// EDHREC rank 12052.
//
// Rulings:
//   [2025-04-04] Spells that were cast before a permanent with flurry count. If that permanent was
//     the first spell you cast that turn, the next spell you cast that turn is your second spell.

const FLURRY_TEXT =
  "Flurry — Whenever you cast your second spell each turn, this creature deals 1 damage to each opponent.";

export default defineCard({
  name: "Devoted Duelist",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Monk"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${FLURRY_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: FLURRY_TEXT,
    },
  ],
});
