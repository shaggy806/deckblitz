import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Cramped Vents // Access Maze (cramped-vents-access-maze.ts).
const UNLOCK =
  "When you unlock this door, this Room deals 6 damage to target creature an opponent controls. You gain life equal to the excess damage dealt this way.";

export default defineCard({
  name: "Cramped Vents",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 6, target: 0 },
          { kind: "gain-life", amount: { excessDamageThisWay: true } },
        ],
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Cramped Vents // Access Maze", "Cramped Vents", "Access Maze"],
  split: true,
});
