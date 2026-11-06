import { defineCard } from "../define.js";

// EDHREC rank 27550.
// Its power is a characteristic-defining ability (rule 604.3), counting
// itself while it's an artifact creature you control.

const POWER_TEXT = "Collective Drone's power is equal to the number of artifact creatures you control.";

export default defineCard({
  name: "Collective Drone",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 0,
  toughness: 2,
  text: POWER_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { types: ["artifact", "creature"], controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
});
