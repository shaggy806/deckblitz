import { defineCard } from "../define.js";

// EDHREC rank 24668.
//
// Rulings:
//   [2008-08-01] This is a Characteristic-Defining Ability. It checks the number of non-Wall
//     creatures you control continuously, and applies in all zones. It is never "locked in".

const PT_TEXT = "Keldon Warlord's power and toughness are each equal to the number of non-Wall creatures you control.";

export default defineCard({
  name: "Keldon Warlord",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you", notSubtypes: ["Wall"] } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
