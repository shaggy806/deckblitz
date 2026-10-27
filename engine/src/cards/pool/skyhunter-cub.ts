import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 26285. Kitesail Apprentice's static.

const TEXT = "As long as this creature is equipped, it gets +1/+1 and has flying.";

export default defineCard({
  name: "Skyhunter Cub",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Knight"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
