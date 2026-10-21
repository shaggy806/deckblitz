import { defineCard } from "../define.js";

export default defineCard({
  name: "Deathbellow War Cry",
  manaCost: "{5}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Search your library for up to four Minotaur creature cards with different names, put them onto the battlefield, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "creature", subtype: "Minotaur" },
    destination: "battlefield",
    min: 0,
    max: 4,
    together: { distinctNames: true },
  },
});
