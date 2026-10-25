import { defineCard } from "../define.js";

// Kodama's Reach's search (one card found goes onto the battlefield tapped —
// the ruling), then scry 1 after the shuffle.
export default defineCard({
  name: "Peregrination",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to two basic land cards, reveal those cards, and put one onto the battlefield tapped and the other into your hand. Shuffle, then scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        min: 0,
        max: 2,
        destination: "battlefield",
        enterTapped: true,
        restDestination: "hand",
        reveal: true,
      },
      { kind: "scry", amount: 1 },
    ],
  },
});
