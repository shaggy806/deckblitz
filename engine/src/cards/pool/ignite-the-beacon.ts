import { defineCard } from "../define.js";

export default defineCard({
  name: "Ignite the Beacon",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Search your library for up to two planeswalker cards, reveal them, put them into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "planeswalker" },
    destination: "hand",
    min: 0,
    max: 2,
    reveal: true,
  },
});
