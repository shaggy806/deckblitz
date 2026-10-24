import { defineCard } from "../define.js";

// EDHREC rank 7450.
export default defineCard({
  name: "Might Sliver",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "All Sliver creatures get +2/+2.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantPt: [2, 2],
      text: "All Sliver creatures get +2/+2.",
    },
  ],
});
