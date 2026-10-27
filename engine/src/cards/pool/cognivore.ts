import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 28058. Cruel Somnophage's characteristic-defining
// count over every graveyard, for instant cards.

const CDA_TEXT = "Cognivore's power and toughness are each equal to the number of instant cards in all graveyards.";

export default defineCard({
  name: "Cognivore",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${CDA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "instant" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA_TEXT,
    },
  ],
});
