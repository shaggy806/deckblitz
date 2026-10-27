import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 28192. Leonin Lightbringer's pump and Sunspear
// Shikari's first strike, under one "as long as this creature is equipped".

export default defineCard({
  name: "Auriok Glaivemaster",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "As long as this creature is equipped, it gets +1/+1 and has first strike.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: "As long as this creature is equipped, it gets +1/+1 and has first strike.",
    },
  ],
});
