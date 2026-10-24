import { defineCard } from "../define.js";

export default defineCard({
  name: "Strategic Planning",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.",
  targets: [],
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
