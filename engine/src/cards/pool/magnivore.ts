import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 17733. Cruel Somnophage's characteristic-
// defining count (a CDA works in every zone), of sorcery cards.

const CDA_TEXT =
  "Magnivore's power and toughness are each equal to the number of sorcery cards in all graveyards.";

export default defineCard({
  name: "Magnivore",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 0,
  keywords: ["haste"],
  text: `Haste (This creature can attack and {T} as soon as it comes under your control.)\n${CDA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "sorcery" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA_TEXT,
    },
  ],
});
