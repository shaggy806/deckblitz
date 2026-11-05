import { defineCard } from "../define.js";

// X is chosen as the trigger resolves, at most the life gained (its trigger
// value), and paid then.

const TEXT =
  "Whenever you gain life, you may pay {X}, where X is less than or equal to the amount of life you gained. If you do, draw X cards.";

export default defineCard({
  name: "Well of Lost Dreams",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to draw X cards?",
        cost: "{X}",
        maxX: { triggerValue: true },
        effect: { kind: "draw", amount: "x" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
