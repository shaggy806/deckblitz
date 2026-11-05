import { defineCard } from "../define.js";

// EDHREC rank 30757.

const CHOOSE = "As this creature enters, choose an opponent.";
const POWER = "Pallimud's power is equal to the number of tapped lands the chosen player controls.";

export default defineCard({
  name: "Pallimud",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 3,
  text: `${CHOOSE}\n${POWER}`,
  choosePlayerOnEnter: "opponent",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", tapped: true, controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
        forChosenPlayer: true,
      },
      text: POWER,
    },
  ],
});
