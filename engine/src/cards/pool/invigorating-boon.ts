import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 26493.

const TEXT = "Whenever a player cycles a card, you may put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Invigorating Boon",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cycles", who: "any" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on the targeted creature?",
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
