import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 14849.

const ENTER_TEXT = "When this Siege enters, you gain 4 life and draw a card.";

export default defineCard({
  name: "Invasion of Dominaria",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 4 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Dominaria", "Serra Faithkeeper"],
  transform: true,
});
