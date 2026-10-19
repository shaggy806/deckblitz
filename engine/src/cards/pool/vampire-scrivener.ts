import { defineCard } from "../define.js";

// "During your turn" is part of each trigger condition (rule 603.1), not an
// intervening "if": checked as the life changes. One trigger per life-gain or
// life-loss event, however much (the rulings).
const GAIN_TEXT = "Whenever you gain life during your turn, put a +1/+1 counter on this creature.";
const LOSE_TEXT = "Whenever you lose life during your turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Vampire Scrivener",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warlock"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${GAIN_TEXT}\n${LOSE_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GAIN_TEXT,
    },
    {
      trigger: { on: "loses-life", who: "you" },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
});
