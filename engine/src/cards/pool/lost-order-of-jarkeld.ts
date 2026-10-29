import { defineCard } from "../define.js";

// Ice Age. A characteristic-defining ability read from the chosen opponent's
// side; with nobody chosen (anywhere but the battlefield) or once that player
// has left the game, it's a 1/1 (its ruling).

const CHOOSE = "As this creature enters, choose an opponent.";
const PT = "Lost Order of Jarkeld's power and toughness are each equal to 1 plus the number of creatures the chosen player controls.";

export default defineCard({
  name: "Lost Order of Jarkeld",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  text: `${CHOOSE}\n${PT}`,
  choosePlayerOnEnter: "opponent",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 1,
        plusToughness: 1,
        forChosenPlayer: true,
      },
      text: PT,
    },
  ],
});
