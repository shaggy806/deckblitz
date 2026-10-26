import { defineCard } from "../define.js";

const TRANSFORM_TEXT =
  "At the beginning of your upkeep, you may pay {2}{B}{B}. If you do, transform this creature.";

export default defineCard({
  name: "Screeching Bat",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B}{B} to transform Screeching Bat?",
        cost: "{2}{B}{B}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Screeching Bat", "Stalking Vampire"],
  transform: true,
});
