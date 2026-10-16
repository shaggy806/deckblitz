import { defineCard } from "../define.js";
import { ROOM_REMINDER, distinctTargets, unlockThisDoor } from "../helpers.js";

// The right door of Grand Entryway // Elegant Rotunda (grand-entryway-elegant-rotunda.ts).
// "Each of up to two target creatures": two optional slots, never the same
// creature twice (Byrke's shape).
const UNLOCK = "When you unlock this door, put a +1/+1 counter on each of up to two target creatures.";

export default defineCard({
  name: "Elegant Rotunda",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("right"),
      targets: distinctTargets(2, "creature", { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Grand Entryway // Elegant Rotunda", "Grand Entryway", "Elegant Rotunda"],
  split: true,
});
