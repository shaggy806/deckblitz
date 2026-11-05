import { defineCard } from "../define.js";

// EDHREC rank 31873.

export default defineCard({
  name: "Aven Soulgazer",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{2}{W}: Look at target face-down creature.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", faceDown: true } }],
      effect: { kind: "look-at-face-down", target: 0 },
      resolve: null,
      text: "{2}{W}: Look at target face-down creature.",
    },
  ],
});
