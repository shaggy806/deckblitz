import { defineCard } from "../define.js";

// EDHREC rank 3027. The searcher puts the find onto the battlefield, so it's
// theirs, enters abilities and all (the rulings); "a creature card" may fail
// to find (rule 701.23b).

export default defineCard({
  name: "Bribery",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search target opponent's library for a creature card and put that card onto the battlefield under your control. Then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "search-library",
    whose: { target: 0 },
    filter: { type: "creature" },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
