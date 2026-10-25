import { defineCard } from "../define.js";

// A tutor-to-top: the finds are revealed, the library shuffled, and they go
// on top in the order chosen, the first chosen on top.
export default defineCard({
  name: "Congregation at Dawn",
  manaCost: "{G}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Search your library for up to three creature cards, reveal them, then shuffle and put those cards on top in any order.",
  effect: {
    kind: "search-library",
    filter: { type: "creature" },
    destination: "library-top",
    min: 0,
    max: 3,
    reveal: true,
  },
});
