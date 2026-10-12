import { defineCard } from "../define.js";

// Sanar, Unfinished Genius's prepare spell (rule 722): no card of its own,
// only ever cast as the copy a prepared Sanar makes in exile (722.3c).
export default defineCard({
  name: "Wild Idea",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { typesAnyOf: ["instant", "sorcery"] },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
});
