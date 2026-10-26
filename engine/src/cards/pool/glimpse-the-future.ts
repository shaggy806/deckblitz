import { defineCard } from "../define.js";

// EDHREC rank 26619.

export default defineCard({
  name: "Glimpse the Future",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "graveyard",
  },
});
