import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 10362.
//
// Winged Sliver's shape: every Sliver creature, whoever controls it, itself
// included.
export default defineCard({
  name: "Fury Sliver",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: "All Sliver creatures have double strike.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["double-strike"],
      text: "All Sliver creatures have double strike.",
    },
  ],
});
