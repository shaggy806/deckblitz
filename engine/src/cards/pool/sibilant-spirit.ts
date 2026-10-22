import { defineCard } from "../define.js";

// EDHREC rank 31534.
//
// Rulings:
//   [2004-10-04] Your opponent does not have to draw a card if they don’t want to.

const TEXT = "Whenever this creature attacks, defending player may draw a card.";

export default defineCard({
  name: "Sibilant Spirit",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-player",
        prompt: "Draw a card?",
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
