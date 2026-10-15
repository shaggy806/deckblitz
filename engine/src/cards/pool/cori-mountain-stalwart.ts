import { defineCard } from "../define.js";

// EDHREC rank 15445.
//
// Rulings:
//   [2025-04-04] Spells that were cast before a permanent with flurry count. If that permanent
//     was the first spell you cast that turn, the next spell you cast that turn is your second
//     spell.

const TEXT =
  "Flurry — Whenever you cast your second spell each turn, this creature deals 2 damage to each opponent and you gain 2 life.";

export default defineCard({
  name: "Cori Mountain Stalwart",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
