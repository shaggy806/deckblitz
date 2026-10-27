import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 21834.

const TEXT = "Cleric creatures have vigilance.";

export default defineCard({
  name: "Akroma's Devoted",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Cleric" } },
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
