import { defineCard } from "../define.js";

// EDHREC rank 25336. Each target player in turn is asked whether to search
// (Geomancer's Gambit's "may search"), the land entering under their control.
export default defineCard({
  name: "Turtle Tracks",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Any number of target players may each search their library for a basic land card, put it onto the battlefield under their control, then shuffle.",
  targets: [{ kind: "any-number", of: "player" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "each-player-may",
      who: { target: 0 },
      prompt: "Search your library for a basic land card?",
      effect: {
        kind: "search-library",
        filter: { type: "land", supertype: "basic" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
    },
  },
});
