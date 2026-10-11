import { defineCard } from "../define.js";

// EDHREC rank 16275.

const FLASH_TEXT = "As long as Quicksilver is tapped, you may cast spells as though they had flash.";

// Heliod, the Warped Eclipse's permission, gated on the source being tapped.
export default defineCard({
  name: "Quicksilver, Speedster",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["flash", "double-strike", "haste"],
  text: `Flash\nDouble strike, haste\n${FLASH_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: true } },
      castAsThoughFlash: true,
      text: FLASH_TEXT,
    },
  ],
});
