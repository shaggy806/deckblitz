import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 18109. Might Sliver's shape: every player's
// Sliver creatures.

const TEXT = "All Sliver creatures get +0/+2.";

export default defineCard({
  name: "Watcher Sliver",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantPt: [0, 2],
      text: TEXT,
    },
  ],
});
