import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 9220.

export default defineCard({
  name: "Reality Heist",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nLook at the top seven cards of your library. You may reveal up to two artifact cards from among them and put them into your hand. Put the rest on the bottom of your library in a random order.",
  selfCostReduction: affinity({ type: "artifact" }),
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    reveal: "chosen",
    min: 0,
    max: 2,
    filter: { type: "artifact" },
    destination: "hand",
    leftover: "bottom-random",
  },
});
