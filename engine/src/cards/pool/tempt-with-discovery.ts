import { defineCard } from "../define.js";

// Commander 2013 (C13). EDHREC rank 883. Every search here shuffles once, at
// the end ("then each player who searched a library this way shuffles"). The
// opponents say in turn from your left, then search together (the rulings; the
// search in an `each-player-may`); the rest of yours follow.
const SEARCH = {
  kind: "search-library",
  filter: { type: "land" },
  destination: "battlefield",
  min: 0,
  max: 1,
  shufflesLater: true,
} as const;

export default defineCard({
  name: "Tempt with Discovery",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Tempting offer — Search your library for a land card and put it onto the battlefield. Each opponent may search their library for a land card and put it onto the battlefield. For each opponent who searches a library this way, search your library for a land card and put it onto the battlefield. Then each player who searched a library this way shuffles.",
  effect: {
    kind: "sequence",
    effects: [
      SEARCH,
      {
        kind: "each-player-may",
        who: "each-opponent",
        startingWithYou: true,
        prompt: "Search your library for a land card and put it onto the battlefield?",
        effect: SEARCH,
        ifDid: SEARCH,
      },
      { kind: "shuffle-library", searchers: true },
    ],
  },
});
