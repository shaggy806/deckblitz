import { defineCard } from "../define.js";

// EDHREC rank 29717.

const CDA_TEXT =
  "Cantivore's power and toughness are each equal to the number of enchantment cards in all graveyards.";

export default defineCard({
  name: "Cantivore",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 0,
  keywords: ["vigilance"],
  text: `Vigilance\n${CDA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "enchantment" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA_TEXT,
    },
  ],
});
