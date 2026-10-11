import { defineCard } from "../define.js";

// EDHREC rank 11860.

// Sylvan Tutor's shape: a hidden-zone search may find nothing (min 0).
export default defineCard({
  name: "Loyal Tutor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Search your library for a planeswalker card, reveal it, then shuffle and put that card on top.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "planeswalker" },
    destination: "library-top",
    min: 0,
    max: 1,
    reveal: true,
  },
});
