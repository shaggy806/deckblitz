import { defineCard } from "../define.js";

// EDHREC rank 25803.
//
// Rulings:
//   [2011-06-01] Slag Fiend’s power- and toughness-setting ability works in all zones, not just on
//     the battlefield.
//
// Cruel Somnophage's characteristic-defining count.

const CDA_TEXT =
  "Slag Fiend's power and toughness are each equal to the number of artifact cards in all graveyards.";

export default defineCard({
  name: "Slag Fiend",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 0,
  toughness: 0,
  text: CDA_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "artifact" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA_TEXT,
    },
  ],
});
