import { defineCard } from "../define.js";

export default defineCard({
  name: "Shimmer of Possibility",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top four cards of your library. Put one of them into your hand and the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "bottom-random",
  },
});
