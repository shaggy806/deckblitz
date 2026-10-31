import { defineCard } from "../define.js";

// "Into your hand or graveyard": the searcher's choice once the find is
// revealed (`search-library`'s `instead`, `pick: "any"`), the shuffle after.
export default defineCard({
  name: "Dina's Guidance",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: "Search your library for a creature card, reveal it, put it into your hand or graveyard, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "creature" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    instead: { destination: "graveyard", pick: "any" },
  },
});
