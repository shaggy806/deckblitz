import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 20965.

const POWER = "Wilderness Elemental's power is equal to the number of nonbasic lands your opponents control.";

export default defineCard({
  name: "Wilderness Elemental",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${POWER}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", notSupertype: "basic", controlledBy: "opponent" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER,
    },
  ],
});
