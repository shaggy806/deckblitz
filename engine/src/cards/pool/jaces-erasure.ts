import { defineCard } from "../define.js";

// Once per card drawn (the ruling).
const TEXT = "Whenever you draw a card, you may have target player mill a card.";

export default defineCard({
  name: "Jace's Erasure",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have the target player mill a card?",
        effect: { kind: "mill", target: 0, amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
