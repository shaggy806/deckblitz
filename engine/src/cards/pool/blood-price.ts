import { defineCard } from "../define.js";

export default defineCard({
  name: "Blood Price",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Look at the top four cards of your library. Put two of them into your hand and the rest on the bottom of your library in any order. You lose 2 life.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 2,
        max: 2,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      { kind: "lose-life", amount: 2 },
    ],
  },
});
