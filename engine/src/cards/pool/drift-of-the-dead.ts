import { defineCard } from "../define.js";

// EDHREC rank 23863.
const PT_TEXT = "Drift of the Dead's power and toughness are each equal to the number of snow lands you control.";

export default defineCard({
  name: "Drift of the Dead",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 0,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", supertype: "snow", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
