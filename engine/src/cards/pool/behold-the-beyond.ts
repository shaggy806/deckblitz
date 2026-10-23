import { defineCard } from "../define.js";

export default defineCard({
  name: "Behold the Beyond",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Discard your hand. Search your library for three cards, put them into your hand, then shuffle.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      // "Three cards", no quality: three must be found while there are
      // three (rule 701.23d), as Demonic Tutor's one.
      { kind: "search-library", filter: {}, destination: "hand", min: 3, max: 3 },
    ],
  },
});
