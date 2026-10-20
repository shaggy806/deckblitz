import { defineCard } from "../define.js";

const TARGET_TEXT = "Whenever this creature becomes the target of a spell you control, draw a card.";

export default defineCard({
  name: "Stormchaser Drake",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TARGET_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true, byControllerOnly: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
});
