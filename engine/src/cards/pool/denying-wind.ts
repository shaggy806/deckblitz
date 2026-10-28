import { defineCard } from "../define.js";

// EDHREC rank 22403.

export default defineCard({
  name: "Denying Wind",
  manaCost: "{7}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search target player's library for up to seven cards and exile them. Then that player shuffles.",
  targets: ["player"],
  effect: {
    kind: "search-library",
    whose: { target: 0 },
    filter: {},
    destination: "exile",
    min: 0,
    max: 7,
  },
});
