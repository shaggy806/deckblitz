import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 27151.
//
// Rulings:
//   [2004-10-04] Counts plains controlled by all opponents.

export default defineCard({
  name: "Marauding Knight",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Knight"],
  power: 2,
  toughness: 2,
  text: "Protection from white\nThis creature gets +1/+1 for each Plains your opponents control.",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Plains", controlledBy: "opponent" }, pt: [1, 1] },
      text: "This creature gets +1/+1 for each Plains your opponents control.",
    },
  ],
});
