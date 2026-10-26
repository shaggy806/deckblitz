import { defineCard } from "../define.js";

// EDHREC rank 10759.

export default defineCard({
  name: "Bonesplitter Sliver",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "All Sliver creatures get +2/+0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantPt: [2, 0],
      text: "All Sliver creatures get +2/+0.",
    },
  ],
});
