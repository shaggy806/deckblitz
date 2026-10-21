import { defineCard } from "../define.js";

export default defineCard({
  name: "Drawn from Dreams",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top seven cards of your library. Put two of them into your hand and the rest on the bottom of your library in a random order.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    min: 2,
    max: 2,
    destination: "hand",
    leftover: "bottom-random",
  },
});
