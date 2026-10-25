import { defineCard } from "../define.js";

// EDHREC rank 17853. Khans of Tarkir.

export default defineCard({
  name: "Bitter Revelation",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Look at the top four cards of your library. Put two of them into your hand and the rest into your graveyard. You lose 2 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", zone: "library", count: 4, min: 2, max: 2, destination: "hand", leftover: "graveyard" },
      { kind: "lose-life", amount: 2 },
    ],
  },
});
