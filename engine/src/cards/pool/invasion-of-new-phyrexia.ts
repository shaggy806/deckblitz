import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// X is the X it was cast with.

const ENTER_TEXT = "When this Siege enters, create X 2/2 white and blue Knight creature tokens with vigilance.";

export default defineCard({
  name: "Invasion of New Phyrexia",
  manaCost: "{X}{W}{U}",
  colors: ["W", "U"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 6,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token (Chivalric Alliance)", count: "x" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of New Phyrexia", "Teferi Akosa of Zhalfir"],
  transform: true,
});
