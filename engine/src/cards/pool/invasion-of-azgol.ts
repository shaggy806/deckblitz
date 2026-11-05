import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

const ENTER_TEXT =
  "When this Siege enters, target player sacrifices a creature or planeswalker of their choice and loses 1 life.";

export default defineCard({
  name: "Invasion of Azgol",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "target", filter: { typesAnyOf: ["creature", "planeswalker"] }, count: 1 },
          { kind: "lose-life", amount: 1, target: 0 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Azgol", "Ashen Reaper"],
  transform: true,
});
