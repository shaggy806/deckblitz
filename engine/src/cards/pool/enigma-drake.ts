import { defineCard } from "../define.js";

const POWER_TEXT = "Enigma Drake's power is equal to the number of instant and sorcery cards in your graveyard.";

export default defineCard({
  name: "Enigma Drake",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${POWER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
});
