import { defineCard } from "../define.js";
import { crew, scavenge } from "../helpers.js";

// The power CDA works in every zone (the ruling), and scavenge reads it as it
// last existed in the graveyard: the ability's own record of the card it
// exiled, so a creature destroyed in response changes nothing.
const POWER_TEXT = "Dodgy Jalopy's power is equal to the greatest mana value among creatures you control.";

export default defineCard({
  name: "Dodgy Jalopy",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 0,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${POWER_TEXT}\nCrew 3\nScavenge {2}{G} ({2}{G}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)`,
  activated: [crew(3), scavenge("{2}{G}")],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { greatestManaValueOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
});
