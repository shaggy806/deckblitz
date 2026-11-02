import { defineCard } from "../define.js";

export default defineCard({
  name: "Shared Summons",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Search your library for up to two creature cards with different names, reveal them, put them into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "creature" },
    destination: "hand",
    reveal: true,
    min: 0,
    max: 2,
    together: { distinctNames: true },
  },
});
