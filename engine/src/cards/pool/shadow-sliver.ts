import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 11379.
//
// Winged Sliver's shape: every Sliver creature, whoever controls it, itself
// included.
export default defineCard({
  name: "Shadow Sliver",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: "All Sliver creatures have shadow. (They can block or be blocked by only creatures with shadow.)",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["shadow"],
      text: "All Sliver creatures have shadow.",
    },
  ],
});
