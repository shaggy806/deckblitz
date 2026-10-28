import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 17665. The tax reaches sources in every zone, mana abilities
// included.

const NAME = "As this Vehicle enters, choose a nonland card name.";
const TAX = "Activated abilities of sources with the chosen name cost {2} more to activate.";

export default defineCard({
  name: "Skyseer's Chariot",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${NAME}\n${TAX}\n${crewText(2)}`,
  chooseCardNameOnEnter: { filter: { notTypes: ["land"] }, aim: "opponent-permanents" },
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: { chosenName: true }, increaseGeneric: 2, anyZone: true },
      text: TAX,
    },
  ],
  activated: [crew(2, crewText(2))],
});
