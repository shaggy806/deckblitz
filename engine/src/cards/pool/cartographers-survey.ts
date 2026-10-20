import { defineCard } from "../define.js";

export default defineCard({
  name: "Cartographer's Survey",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top seven cards of your library. Put up to two land cards from among them onto the battlefield tapped. Put the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    min: 0,
    max: 2,
    filter: { type: "land" },
    destination: "battlefield",
    enterTapped: true,
    leftover: "bottom-random",
  },
});
