import { defineCard } from "../define.js";

const CHOOSE = "As this creature enters, choose an opponent.";
const PT = "Skyshroud War Beast's power and toughness are each equal to the number of nonbasic lands the chosen player controls.";

export default defineCard({
  name: "Skyshroud War Beast",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${CHOOSE}\n${PT}`,
  choosePlayerOnEnter: "opponent",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", notSupertype: "basic", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        forChosenPlayer: true,
      },
      text: PT,
    },
  ],
});
