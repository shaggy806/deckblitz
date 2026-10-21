import { defineCard } from "../define.js";

const END_TEXT = "At the beginning of your end step, you gain 1 life for each creature you control with vigilance.";

export default defineCard({
  name: "Alert Heedbonder",
  manaCost: "{1}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // Counted as it resolves, itself included (its ruling).
      effect: {
        kind: "gain-life",
        amount: { countOf: { type: "creature", controlledBy: "you", keyword: "vigilance" } },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
