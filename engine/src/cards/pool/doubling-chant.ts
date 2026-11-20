import { defineCard } from "../define.js";

// EDHREC rank 19738.
//
// One search, a slot for each creature you control as it resolves, each
// filled by at most one creature card with that creature's name; the finds
// enter together, then the library is shuffled. Two creatures with one name
// find up to two cards of it.

const YOUR_CREATURES = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Doubling Chant",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "For each creature you control, you may search your library for a creature card with the same name as that creature. Put those cards onto the battlefield, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "creature" },
    destination: "battlefield",
    min: 0,
    max: { countOf: YOUR_CREATURES },
    upTo: true,
    together: { oneEachSameNameAs: YOUR_CREATURES },
  },
});
