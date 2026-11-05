import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// The front face; the back is Caetus, Sea Tyrant of Segovia
// (caetus-sea-tyrant-of-segovia.ts).
const ENTER = "When this Siege enters, create two 1/1 blue Kraken creature tokens with trample.";

export default defineCard({
  name: "Invasion of Segovia",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Kraken Token (Trample)", count: 2 },
      resolve: null,
      text: ENTER,
    },
  ],
  faces: ["Invasion of Segovia", "Caetus, Sea Tyrant of Segovia"],
  transform: true,
});
