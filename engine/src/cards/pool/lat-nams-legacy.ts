import { defineCard } from "../define.js";

// EDHREC rank 16399. Alliances.
//
// The shuffle is mandatory; "if you do" fails only with an empty hand, and
// then nothing is drawn (the ruling) — See Beyond's hand-to-library shape.

export default defineCard({
  name: "Lat-Nam's Legacy",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Shuffle a card from your hand into your library. If you do, draw two cards at the beginning of the next turn's upkeep.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "hand-size", atLeast: 1 },
    then: {
      kind: "sequence",
      effects: [
        { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "library-top", leftover: "stay" },
        { kind: "shuffle-library" },
        {
          kind: "delayed-trigger",
          at: "next-upkeep",
          effect: { kind: "draw", amount: 2 },
          text: "Draw two cards.",
        },
      ],
    },
  },
});
