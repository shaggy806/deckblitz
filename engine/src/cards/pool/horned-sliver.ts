import { defineCard } from "../define.js";

// EDHREC rank 7308.
export default defineCard({
  name: "Horned Sliver",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "All Sliver creatures have trample.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["trample"],
      text: "All Sliver creatures have trample.",
    },
  ],
});
