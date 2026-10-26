import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 16837.
//
// Layer 4, on the battlefield only: creature spells and cards elsewhere are
// untouched (the ruling).
export default defineCard({
  name: "Hivestone",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "Creatures you control are Slivers in addition to their other creature types.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      addSubtypes: ["Sliver"],
      text: "Creatures you control are Slivers in addition to their other creature types.",
    },
  ],
});
