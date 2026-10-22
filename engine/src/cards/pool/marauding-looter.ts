import { defineCard } from "../define.js";

// EDHREC rank 21803.
//
// Rulings: raid reads the whole turn — the attacker needn't still be around,
// nor this creature have been on the battlefield when you attacked.

const TEXT =
  "Raid — At the beginning of your end step, if you attacked this turn, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Marauding Looter",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
