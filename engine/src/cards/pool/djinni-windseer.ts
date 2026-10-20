import { defineCard } from "../define.js";

// EDHREC rank 16530.

const ROLL_TEXT = "When this creature enters, roll a d20.\n1—9 | Scry 1.\n10—19 | Scry 2.\n20 | Scry 3.";

export default defineCard({
  name: "Djinni Windseer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ROLL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "scry", amount: 1 } },
          { min: 10, max: 19, effect: { kind: "scry", amount: 2 } },
          { min: 20, effect: { kind: "scry", amount: 3 } },
        ],
      },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
});
