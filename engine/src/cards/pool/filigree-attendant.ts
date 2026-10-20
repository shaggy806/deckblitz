import { defineCard } from "../define.js";

const CDA_TEXT = "Filigree Attendant's power is equal to the number of artifacts you control.";

export default defineCard({
  name: "Filigree Attendant",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Homunculus"],
  power: 0,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${CDA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "artifact", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: CDA_TEXT,
    },
  ],
});
