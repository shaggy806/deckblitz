import { defineCard } from "../define.js";

// EDHREC rank 16142. Jungle Wayfinder's each-player search, up to the
// spell's X (Nylea's Intervention).

export default defineCard({
  name: "Weird Harvest",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Each player may search their library for up to X creature cards, reveal those cards, put them into their hand, then shuffle.",
  targets: [],
  effect: {
    kind: "each-player-may",
    who: "each-player",
    prompt: "Search your library for up to X creature cards?",
    effect: {
      kind: "search-library",
      filter: { type: "creature" },
      destination: "hand",
      reveal: true,
      min: 0,
      max: "x",
    },
  },
});
