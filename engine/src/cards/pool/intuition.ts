import { defineCard } from "../define.js";

// Three cards with no stated quality must be found if they're there (rule
// 701.23b only lets a search of a stated quality fail). The target opponent
// picks among the revealed finds; the other two go to the graveyard, and the
// library is shuffled after both moves.
export default defineCard({
  name: "Intuition",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Search your library for three cards and reveal them. Target opponent chooses one. Put that card into your hand " +
    "and the rest into your graveyard. Then shuffle.",
  targets: ["opponent"],
  effect: {
    kind: "search-library",
    filter: {},
    destination: "graveyard",
    min: 3,
    max: 3,
    reveal: true,
    instead: { destination: "hand", pick: "one", chooser: { target: 0 } },
  },
});
