import { defineCard } from "../define.js";

// EDHREC rank 12073.

const TRIGGER_TEXT = "Whenever you play a land or cast a spell, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Infernal Sovereign",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\nSkip your draw step.\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      skipsSteps: { who: "you", steps: ["draw"] },
      text: "Skip your draw step.",
    },
  ],
  triggered: [
    {
      trigger: { on: "plays-card", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
