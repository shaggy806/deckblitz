import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK).
export default defineCard({
  name: "Seek the Horizon",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to three basic land cards, reveal them, put them into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "hand",
    reveal: true,
    min: 0,
    max: 3,
  },
});
