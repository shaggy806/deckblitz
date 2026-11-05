import { defineCard } from "../define.js";

// EDHREC rank 31957. Counted from the chosen opponent's side whoever controls
// it now; 1 with nobody chosen or once they've left the game (its ruling).

const CHOOSE = "As this creature enters, choose an opponent.";
const POWER =
  "Haunting Apparition's power is equal to 1 plus the number of green creature cards in the chosen player's graveyard.";

export default defineCard({
  name: "Haunting Apparition",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${CHOOSE}\n${POWER}`,
  choosePlayerOnEnter: "opponent",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature", colors: ["G"], ownedBy: "you" } },
        plusPower: 1,
        plusToughness: 0,
        only: "power",
        forChosenPlayer: true,
      },
      text: POWER,
    },
  ],
});
