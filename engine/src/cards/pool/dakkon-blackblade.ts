import { defineCard } from "../define.js";

// Legends. EDHREC rank 19231.

const PT_TEXT = "Dakkon Blackblade's power and toughness are each equal to the number of lands you control.";

export default defineCard({
  name: "Dakkon Blackblade",
  manaCost: "{2}{W}{U}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
