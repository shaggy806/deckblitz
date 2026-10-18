import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 13419.

const ENTER_TEXT = "When this Siege enters, it deals 3 damage to each creature and each planeswalker.";

export default defineCard({
  name: "Invasion of Karsus",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { typesAnyOf: ["creature", "planeswalker"] }, amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Karsus", "Refraction Elemental"],
  transform: true,
});
