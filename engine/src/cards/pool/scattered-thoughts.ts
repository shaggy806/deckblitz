import { defineCard } from "../define.js";

export default defineCard({
  name: "Scattered Thoughts",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Look at the top four cards of your library. Put two of those cards into your hand and the rest into your graveyard.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    min: 2,
    max: 2,
    destination: "hand",
    leftover: "graveyard",
  },
});
