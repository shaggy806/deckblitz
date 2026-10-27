import { defineCard } from "../define.js";

const CDA_TEXT =
  "Terravore's power and toughness are each equal to the number of land cards in all graveyards.";

export default defineCard({
  name: "Terravore",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${CDA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "land" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA_TEXT,
    },
  ],
});
