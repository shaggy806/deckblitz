import { defineCard } from "../define.js";

// Its power is a characteristic-defining ability (rule 604.3).
const POWER_TEXT = "Freedom Fighter Recruit's power is equal to the number of creatures you control.";

export default defineCard({
  name: "Freedom Fighter Recruit",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Ally"],
  power: 0,
  toughness: 2,
  text: POWER_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
});
