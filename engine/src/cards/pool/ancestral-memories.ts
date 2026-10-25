import { defineCard } from "../define.js";

export default defineCard({
  name: "Ancestral Memories",
  manaCost: "{2}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top seven cards of your library. Put two of them into your hand and the rest into your graveyard.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    min: 2,
    max: 2,
    destination: "hand",
    leftover: "graveyard",
  },
});
