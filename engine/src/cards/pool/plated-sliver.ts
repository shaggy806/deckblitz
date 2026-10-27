import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 16140.

export default defineCard({
  name: "Plated Sliver",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: "All Sliver creatures get +0/+1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantPt: [0, 1],
      text: "All Sliver creatures get +0/+1.",
    },
  ],
});
