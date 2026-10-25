import { defineCard } from "../define.js";

// EDHREC rank 29253.

const POWER_TEXT = "Soulsurge Elemental's power is equal to the number of creatures you control.";

export default defineCard({
  name: "Soulsurge Elemental",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${POWER_TEXT}`,
  static: [
    {
      // A CDA, counting itself on the battlefield (the ruling).
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
