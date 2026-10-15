import { defineCard } from "../define.js";

// EDHREC rank 12973.
//
// Rulings:
//   [2025-04-04] Spells that were cast before a permanent with flurry count. If that permanent
//     was the first spell you cast that turn, the next spell you cast that turn is your second
//     spell.

const FLURRY_TEXT =
  "Flurry — Whenever you cast your second spell each turn, create a 1/1 white Bird creature token with flying.";

export default defineCard({
  name: "Wingblade Disciple",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${FLURRY_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token", count: 1 },
      resolve: null,
      text: FLURRY_TEXT,
    },
  ],
});
