import { defineCard } from "../define.js";

// Most common color among all permanents (`most-common-color`), itself counted.

const TEXT = "This creature gets -2/-2 as long as white is the most common color among all permanents or is tied for most common.";

export default defineCard({
  name: "Ruham Djinn",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 5,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "most-common-color", color: "W" },
      grantPt: [-2, -2],
      text: TEXT,
    },
  ],
});
