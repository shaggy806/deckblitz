import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Grand Entryway // Elegant Rotunda (grand-entryway-elegant-rotunda.ts).
const UNLOCK = "When you unlock this door, create a 1/1 white Glimmer enchantment creature token.";

export default defineCard({
  name: "Grand Entryway",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: [],
      effect: { kind: "create-token", token: "Glimmer Token", count: 1 },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Grand Entryway // Elegant Rotunda", "Grand Entryway", "Elegant Rotunda"],
  split: true,
});
