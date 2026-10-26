import { defineCard } from "../define.js";

// EDHREC rank 17483.

export default defineCard({
  name: "Synchronous Sliver",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: "All Sliver creatures have vigilance.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["vigilance"],
      text: "All Sliver creatures have vigilance.",
    },
  ],
});
