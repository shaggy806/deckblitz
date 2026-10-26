import { defineCard } from "../define.js";

// EDHREC rank 28200.

const TEXT = "When this creature enters, you may have target opponent discard a card.";

export default defineCard({
  name: "Ebon Dragon",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "may",
        prompt: "Have the target opponent discard a card?",
        effect: { kind: "discard", target: 0, amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
