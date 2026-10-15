import { defineCard } from "../define.js";

// EDHREC rank 22728.
//
// Rulings:
//   [2025-04-04] Spells that were cast before a permanent with flurry count. If that permanent was
//     the first spell you cast that turn, the next spell you cast that turn is your second spell.

const FLURRY_TEXT =
  "Flurry — Whenever you cast your second spell each turn, this creature gets +1/+1 until end of turn.";
const MANA_TEXT = "{1}: Add {U}, {R}, or {W}. Activate only once each turn.";

export default defineCard({
  name: "Jeskai Devotee",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Monk"],
  power: 2,
  toughness: 2,
  text: `${FLURRY_TEXT}\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: FLURRY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "R", "W"] }, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
      oncePerTurn: true,
    },
  ],
});
