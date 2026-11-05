import { defineCard } from "../define.js";

// The left half of Research // Development. Put with the library, then shuffled,
// which is the same move: nobody sees or orders anything in between.
const FACES = ["Research // Development", "Research", "Development"];

export default defineCard({
  name: "Research",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Shuffle up to four cards you own from outside the game into your library.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: {}, destination: "library-top", min: 0, max: 4, outside: "only" },
      { kind: "shuffle-library" },
    ],
  },
  faces: FACES,
  split: true,
});
