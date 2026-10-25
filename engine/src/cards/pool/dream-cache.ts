import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 9340.
//
// Brainstorm's shape, with where the two cards go chosen as it resolves:
// both on top or both on the bottom, in the order the player picks them.

const TEXT =
  "Draw three cards, then put two cards from your hand both on top of your library or both on the bottom of your library.";

export default defineCard({
  name: "Dream Cache",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put two cards from your hand on top of your library.",
            effect: { kind: "look-and-choose", zone: "hand", min: 2, max: 2, destination: "library-top", leftover: "stay" },
          },
          {
            text: "Put two cards from your hand on the bottom of your library.",
            effect: { kind: "look-and-choose", zone: "hand", min: 2, max: 2, destination: "library-bottom", leftover: "stay" },
          },
        ],
      },
    ],
  },
});
