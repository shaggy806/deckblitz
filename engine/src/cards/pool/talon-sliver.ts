import { defineCard } from "../define.js";

// EDHREC rank 14257.

export default defineCard({
  name: "Talon Sliver",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: "All Sliver creatures have first strike.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["first-strike"],
      text: "All Sliver creatures have first strike.",
    },
  ],
});
