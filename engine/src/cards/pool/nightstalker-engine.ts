import { defineCard } from "../define.js";

// EDHREC rank 31581. A characteristic-defining power (Bloodsworn Knight's
// count, power only).

const TEXT = "Nightstalker Engine's power is equal to the number of creature cards in your graveyard.";

export default defineCard({
  name: "Nightstalker Engine",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightstalker"],
  power: 0,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: TEXT,
    },
  ],
});
