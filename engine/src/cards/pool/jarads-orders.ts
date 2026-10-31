import { defineCard } from "../define.js";

// The split goes card by card (`search-library`'s `instead`, `pick: "one"`):
// once both finds are revealed, the searcher picks the one for their hand and
// the other goes to the graveyard. A single find goes to the hand — "the
// other" can't be followed, so it does only as much as it can (rule 609.3).
export default defineCard({
  name: "Jarad's Orders",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text:
    "Search your library for up to two creature cards and reveal them. Put one into your hand and the other into your graveyard. Then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "creature" },
    destination: "graveyard",
    min: 0,
    max: 2,
    reveal: true,
    instead: { destination: "hand", pick: "one" },
  },
});
