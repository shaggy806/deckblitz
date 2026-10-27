import { defineCard } from "../define.js";

// EDHREC rank 27058.
//
// An intervening-if (rule 603.4): checked as the end step begins and again
// as the trigger resolves.

const TEXT = "At the beginning of your end step, if you control no untapped lands, draw a card.";

export default defineCard({
  name: "Well of Discovery",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
