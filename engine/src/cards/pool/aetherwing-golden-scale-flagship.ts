import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// Brotherhood Vertibird's characteristic-defining power (rule 604.3), itself
// among the artifacts (the ruling).
const CDA_TEXT = "Aetherwing's power is equal to the number of artifacts you control.";

export default defineCard({
  name: "Aetherwing, Golden-Scale Flagship",
  art: "https://cards.scryfall.io/art_crop/back/4/f/4f7231f6-8adc-4a68-9984-e56b974c087b.jpg",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${CDA_TEXT}\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)`,
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
  activated: [crew(1, crewText(1))],
  faces: ["Invasion of Kaladesh", "Aetherwing, Golden-Scale Flagship"],
  transform: true,
});
