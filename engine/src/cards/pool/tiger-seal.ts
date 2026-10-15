import { defineCard } from "../define.js";

// EDHREC rank 22683.
//
// Rulings:
//   [2025-10-02] The second triggered ability can trigger only once each turn. It doesn't matter
//     whether Tiger-Seal was on the battlefield when the first card was drawn.
//   [2025-10-02] If an effect instructs you to draw multiple cards, the ability triggers after you
//     draw whichever is the second one for the turn.

const UPKEEP_TEXT = "At the beginning of your upkeep, tap this creature.";
const DRAW_TEXT = "Whenever you draw your second card each turn, untap this creature.";

export default defineCard({
  name: "Tiger-Seal",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Cat", "Seal"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${UPKEEP_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "tap", target: "source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
