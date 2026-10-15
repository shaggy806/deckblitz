import { defineCard } from "../define.js";

// EDHREC rank 15427.
//
// Rulings:
//   [2026-06-29] The ability that defines Mirkwood Pathmaker's power and toughness works in all
//     zones, not just the battlefield.

const TEXT = "Mirkwood Pathmaker's power and toughness are each equal to the number of lands you control.";

export default defineCard({
  name: "Mirkwood Pathmaker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Ranger"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "land", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: TEXT,
    },
  ],
});
