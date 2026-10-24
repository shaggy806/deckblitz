import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 16654.

const POWER_TEXT = "Zendikar Incarnate's power is equal to the number of lands you control.";

export default defineCard({
  name: "Zendikar Incarnate",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 4,
  text: POWER_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
});
