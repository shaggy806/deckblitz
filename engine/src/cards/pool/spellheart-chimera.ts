import { defineCard } from "../define.js";

const POWER_TEXT = "Spellheart Chimera's power is equal to the number of instant and sorcery cards in your graveyard.";

export default defineCard({
  name: "Spellheart Chimera",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Chimera"],
  power: 0,
  toughness: 3,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${POWER_TEXT}`,
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
