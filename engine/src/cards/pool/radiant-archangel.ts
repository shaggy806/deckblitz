import { defineCard } from "../define.js";

export default defineCard({
  name: "Radiant, Archangel",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nRadiant gets +1/+1 for each other creature on the battlefield with flying.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature", keyword: "flying" }, pt: [1, 1], excludeSelf: true },
      text: "Radiant gets +1/+1 for each other creature on the battlefield with flying.",
    },
  ],
});
