import { defineCard } from "../define.js";

// EDHREC rank 5597.
//
// Cleave (rule 702.148): cleaved, it's "search your library for a card, put it
// into your hand, then shuffle" — with no quality named, a card must be found
// if there is one (rule 701.23b; the ruling), so `min: 1`. The basic land
// search may fail to find.

export default defineCard({
  name: "Dig Up",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Cleave {1}{B}{B}{G} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nSearch your library for a [basic land] card, [reveal it,] put it into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
  cleave: {
    cost: "{1}{B}{B}{G}",
    targets: [],
    effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
  },
});
