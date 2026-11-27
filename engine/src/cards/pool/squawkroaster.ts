import { defineCard } from "../define.js";

// Lorwyn Eclipsed. Its power is a CDA (rule 604.3) that works in every zone
// (the ruling): `setBasePtFromCount`'s `colorsAmong` count, its owner's
// permanents off the battlefield. Lands are normally colorless, and colorless
// isn't a color (the rulings).

const VIVID = "Vivid — Squawkroaster's power is equal to the number of colors among permanents you control.";

export default defineCard({
  name: "Squawkroaster",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 4,
  keywords: ["double-strike"],
  text: `Double strike\n${VIVID}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { colorsAmong: { controlledBy: "you" } }, plusPower: 0, plusToughness: 0, only: "power" },
      text: VIVID,
    },
  ],
});
