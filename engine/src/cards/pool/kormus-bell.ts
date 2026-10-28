import { defineCard } from "../define.js";

// EDHREC rank 13373. Every player's Swamps; Living Plane's shape, and black
// rather than their own colour (layer 5).

const TEXT = "All Swamps are 1/1 black creatures that are still lands.";

export default defineCard({
  name: "Kormus Bell",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Swamp" } },
      addTypes: ["creature"],
      setColors: ["B"],
      setBasePt: { power: 1, toughness: 1 },
      text: TEXT,
    },
  ],
});
