import { defineCard } from "../define.js";

// EDHREC rank 25390. Leonin Lightbringer's shape, with flying.

const TEXT = "As long as this creature is equipped, it gets +1/+1 and has flying.";

export default defineCard({
  name: "Kitesail Apprentice",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 1,
  toughness: 1,
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
