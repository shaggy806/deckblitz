import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 25990.
//
// Two searches; the second reaches the graveyard too (Angrath's Fury's
// `zones`).
export default defineCard({
  name: "Verdant Crescendo",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card and put it onto the battlefield tapped. Search your library and graveyard for a card named Nissa, Nature's Artisan, reveal it, put it into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      {
        kind: "search-library",
        filter: { name: "Nissa, Nature's Artisan" },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 1,
        zones: "library-and-graveyard",
      },
    ],
  },
});
