import { defineCard } from "../define.js";

// EDHREC rank 10442.

export default defineCard({
  name: "Deploy the Gatewatch",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Look at the top seven cards of your library. Put up to two planeswalker cards from among them onto the battlefield. Put the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    min: 0,
    max: 2,
    filter: { type: "planeswalker" },
    destination: "battlefield",
    leftover: "bottom-random",
  },
});
