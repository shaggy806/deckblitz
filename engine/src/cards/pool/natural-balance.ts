import { defineCard } from "../define.js";

// EDHREC rank 23474. The sacrifice first (a player with five or fewer keeps
// them all, unasked), then the players with four or fewer lands *now* are
// asked (`whoIf`, read for each as "that-player"); X is the searcher's own,
// read as they search ("you" in the search is them). One who declines
// doesn't search or shuffle (New Frontiers' shape).
export default defineCard({
  name: "Natural Balance",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Each player who controls six or more lands chooses five lands they control and sacrifices the rest. Each player who controls four or fewer lands may search their library for up to X basic land cards and put them onto the battlefield, where X is five minus the number of lands they control. Then each player who searched their library this way shuffles.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice-all-but", who: "each-player", keep: 5, filter: { type: "land" } },
      {
        kind: "each-player-may",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: { kind: "not", of: { kind: "controls", filter: { type: "land" }, atLeast: 5 } },
        },
        prompt: "Search your library for up to X basic land cards (X is five minus the lands you control)?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "battlefield",
          min: 0,
          max: { difference: [5, { countOf: { type: "land", controlledBy: "you" } }] },
        },
      },
    ],
  },
});
