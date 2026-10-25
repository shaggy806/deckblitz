import { defineCard } from "../define.js";

const POWER_TEXT = "Kolaghan Forerunners's power is equal to the number of creatures you control.";

export default defineCard({
  name: "Kolaghan Forerunners",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 0,
  toughness: 3,
  keywords: ["trample"],
  dash: { cost: "{2}{R}" },
  text: `Trample\n${POWER_TEXT}\nDash {2}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)`,
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
