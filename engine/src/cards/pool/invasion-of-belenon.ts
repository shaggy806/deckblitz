import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 16226.

const ENTER_TEXT = "When this Siege enters, create a 2/2 white and blue Knight creature token with vigilance.";

export default defineCard({
  name: "Invasion of Belenon",
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
      effect: { kind: "create-token", token: "Knight Token (Chivalric Alliance)", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Belenon", "Belenon War Anthem"],
  transform: true,
});
