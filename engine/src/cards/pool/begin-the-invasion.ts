import { defineCard } from "../define.js";

// EDHREC rank 22022. March of the Machine.
//
// Each battle found is asked its protector as it enters (rule 310.11a).

export default defineCard({
  name: "Begin the Invasion",
  manaCost: "{X}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["sorcery"],
  text: "Search your library for up to X battle cards with different names, put them onto the battlefield, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "battle" },
    destination: "battlefield",
    min: 0,
    max: "x",
    together: { distinctNames: true },
  },
});
