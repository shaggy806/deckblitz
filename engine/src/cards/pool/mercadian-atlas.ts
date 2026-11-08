import { defineCard } from "../define.js";

const DRAW_TEXT = "At the beginning of your end step, if you didn't play a land this turn, you may draw a card.";

export default defineCard({
  name: "Mercadian Atlas",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: DRAW_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      // A land played, not one put onto the battlefield (rule 305.1).
      condition: { kind: "not", of: { kind: "turn-history", what: "lands-played", atLeast: 1 } },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
