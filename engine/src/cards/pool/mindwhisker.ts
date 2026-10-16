import { defineCard } from "../define.js";

// EDHREC rank 8364. Bloomburrow.
const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, creatures your opponents control get -1/-0.";

export default defineCard({
  name: "Mindwhisker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Rat", "Wizard"],
  power: 3,
  toughness: 2,
  text: `At the beginning of your upkeep, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, surveil 1.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      condition: { kind: "threshold" },
      grantPt: [-1, 0],
      text: THRESHOLD_TEXT,
    },
  ],
});
