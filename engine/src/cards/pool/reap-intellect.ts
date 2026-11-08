import { defineCard } from "../define.js";

// EDHREC rank 30996. With no card exiled from the hand nothing is searched (the
// ruling); "then that player shuffles" still happens. The search shuffles that
// player's library itself (Surgical Extraction's). You may leave namesakes
// where they are (the ruling): `min: 0`.
export default defineCard({
  name: "Reap Intellect",
  manaCost: "{X}{2}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose up to X nonland cards from it and exile them. For each card exiled this way, search that player's graveyard, hand, and library for any number of cards with the same name as that card and exile them. Then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, upTo: "x", destination: "exile" },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled", atLeast: 1 },
        then: {
          kind: "search-library",
          whose: { target: 0 },
          zones: "graveyard-hand-library",
          filter: { sameNameWith: { thisWay: "exiled" } },
          destination: "exile",
          min: 0,
          max: 99,
        },
        else: { kind: "shuffle-library", target: 0 },
      },
    ],
  },
});
