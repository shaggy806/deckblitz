import { defineCard } from "../define.js";

// EDHREC rank 8640.
export default defineCard({
  name: "Attune with Aether",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, reveal it, put it into your hand, then shuffle. You get {E}{E} (two energy counters).",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      { kind: "get-energy", amount: 2 },
    ],
  },
});
