import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 14841.

const ENTER_TEXT = "When this Siege enters, create a 1/1 colorless Thopter artifact creature token with flying.";

export default defineCard({
  name: "Invasion of Kaladesh",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Kaladesh", "Aetherwing, Golden-Scale Flagship"],
  transform: true,
});
