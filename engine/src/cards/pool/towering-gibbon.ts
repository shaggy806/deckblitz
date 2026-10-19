import { defineCard } from "../define.js";

// EDHREC rank 12214.
//
// A characteristic-defining ability over mana values (Daretti, Rocketeer
// Engineer's shape) — Towering Gibbon counts itself, a creature you control.
const PT_TEXT = "Towering Gibbon's power is equal to the greatest mana value among creatures you control.";

export default defineCard({
  name: "Towering Gibbon",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 0,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { greatestManaValueOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: PT_TEXT,
    },
  ],
});
