import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 14531.

const TEXT = "All Sliver creatures get +1/+0.";

export default defineCard({
  name: "Blade Sliver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantPt: [1, 0],
      text: TEXT,
    },
  ],
});
