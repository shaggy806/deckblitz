import { defineCard } from "../define.js";

// EDHREC rank 14174.

export default defineCard({
  name: "Reflex Sliver",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "All Sliver creatures have haste.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["haste"],
      text: "All Sliver creatures have haste.",
    },
  ],
});
