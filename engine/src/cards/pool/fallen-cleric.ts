import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 31889.
//
// Rulings:
//   [2004-10-04] Protection from clerics prevents damage from cleric sources, can't have any
//     clerics assigned to block it, and can't be targeted by the abilities of clerics.

export default defineCard({
  name: "Fallen Cleric",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 4,
  toughness: 2,
  morph: { keyword: "morph", cost: "{4}{B}" },
  text: "Protection from Clerics\nMorph {4}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Cleric" } },
      text: "Protection from Clerics",
    },
  ],
});
