import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 27226. The threshold-granted end-step trigger exiles
// two cards of its controller's choice from their graveyard (False Memories'
// shape: a graveyard look-and-choose straight to exile).

const END_TEXT = "At the beginning of your end step, exile two cards from your graveyard.";

export default defineCard({
  name: "Bloodcurdler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\nAt the beginning of your upkeep, mill a card.\nThreshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has "${END_TEXT}"`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, mill a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "end", who: "you" },
          targets: [],
          effect: {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 2,
            max: 2,
            destination: "exile",
            leftover: "stay",
          },
          resolve: null,
          text: END_TEXT,
        },
      ],
      text: `Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has "${END_TEXT}"`,
    },
  ],
});
