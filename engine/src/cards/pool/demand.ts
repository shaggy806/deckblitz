import { defineCard } from "../define.js";

// The right half of Supply // Demand.
const FACES = ["Supply // Demand", "Supply", "Demand"];

export default defineCard({
  name: "Demand",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Search your library for a multicolored card, reveal it, put it into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { multicolored: true },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
  faces: FACES,
  split: true,
});
