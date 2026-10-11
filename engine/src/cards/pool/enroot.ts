import { defineCard } from "../define.js";

// Carnivorous Cultivator's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Cultivator makes in exile (722.3c).
export default defineCard({
  name: "Enroot",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Search your library for a land card, put it into your graveyard, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "land" },
    destination: "graveyard",
    min: 0,
    max: 1,
  },
});
