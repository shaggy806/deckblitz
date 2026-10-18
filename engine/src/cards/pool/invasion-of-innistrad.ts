import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 11498.

const ENTER_TEXT = "When this Siege enters, target creature an opponent controls gets -13/-13 until end of turn.";

export default defineCard({
  name: "Invasion of Innistrad",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  keywords: ["flash"],
  text: `${SIEGE_REMINDER}\nFlash\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -13, toughness: -13, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Innistrad", "Deluge of the Dead"],
  transform: true,
});
