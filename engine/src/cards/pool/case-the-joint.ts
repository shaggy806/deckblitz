import { defineCard } from "../define.js";

// A look alone at each library in turn, nothing to pick and nothing moved.
export default defineCard({
  name: "Case the Joint",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw two cards, then look at the top card of each player's library.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          from: "that-player",
          zone: "library",
          count: 1,
          min: 0,
          max: 0,
          destination: "library-top",
          leftover: "stay",
        },
      },
    ],
  },
});
