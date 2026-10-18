import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 20254.

const ENTER_TEXT = "When this Siege enters, return up to one target creature to its owner's hand.";

export default defineCard({
  name: "Invasion of Xerex",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Xerex", "Vertex Paladin"],
  transform: true,
});
