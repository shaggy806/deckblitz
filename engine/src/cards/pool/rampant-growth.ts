import { defineCard } from "../define.js";

export default defineCard({
  name: "Rampant Growth",
  // Pinned: Scryfall answers "Rampant Growth" by name with Studious First-Year // Rampant Growth, whose
  // prepare spell or adventure shares the name.
  art: "b7c47024-5e08-4b17-b41a-7647f8b814b9",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    min: 0,
    max: 1,
    enterTapped: true,
  },
});
