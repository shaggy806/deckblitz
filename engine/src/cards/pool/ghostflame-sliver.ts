import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 20092. Every Sliver permanent, whoever
// controls it (Thran Lens's colour-setting, layer 5, over Slivers).

export default defineCard({
  name: "Ghostflame Sliver",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "All Slivers are colorless.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      setColors: [],
      text: "All Slivers are colorless.",
    },
  ],
});
