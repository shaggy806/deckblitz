import { defineCard } from "../define.js";

export default defineCard({
  name: "Scouting Trek",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for any number of basic land cards, reveal those cards, then shuffle and put them on top.",
  // The finds go on top after the shuffle, in the order chosen (Congregation
  // at Dawn's shape).
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "library-top",
    min: 0,
    max: { librarySize: "you" },
    reveal: true,
  },
});
