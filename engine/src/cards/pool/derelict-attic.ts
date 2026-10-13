import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Derelict Attic // Widow's Walk (derelict-attic-widows-walk.ts).
const UNLOCK = "When you unlock this door, you draw two cards and you lose 2 life.";

export default defineCard({
  name: "Derelict Attic",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Derelict Attic // Widow's Walk", "Derelict Attic", "Widow's Walk"],
  split: true,
});
