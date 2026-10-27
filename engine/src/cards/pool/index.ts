import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 12914. Crystal Seer's shape, five cards.

export default defineCard({
  name: "Index",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top five cards of your library, then put them back in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    min: 5,
    max: 5,
    destination: "library-top",
    leftover: "stay",
  },
});
