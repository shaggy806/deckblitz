import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 25735.

const TEXT = "As long as this creature is equipped, it gets +1/+1 and has vigilance.";

export default defineCard({
  name: "Leonin Den-Guard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
