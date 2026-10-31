import { defineCard } from "../define.js";

// Each hand and graveyard goes in at once, each library is shuffled (rule
// 701.24a), then each player draws seven, in turn order. The spell is on the
// stack as it resolves, so it isn't shuffled in with its own effect: it goes
// to the graveyard afterwards (its reminder text).
export default defineCard({
  name: "Timetwister",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player shuffles their hand and graveyard into their library, then draws seven cards. (Then put Timetwister into its owner's graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
      { kind: "draw", who: "each-player", amount: 7 },
    ],
  },
});
