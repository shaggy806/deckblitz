import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Glassworks // Shattered Yard (glassworks-shattered-yard.ts).
const UNLOCK = "When you unlock this door, this Room deals 4 damage to target creature an opponent controls.";

export default defineCard({
  name: "Glassworks",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Glassworks // Shattered Yard", "Glassworks", "Shattered Yard"],
  split: true,
});
