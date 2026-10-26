import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 14131. "Exile Ill-Gotten Gains" is
// `exileOnResolve` (it's on the stack all the while, so it can't be one of the
// returned cards either way). Each player, in turn order, picks up to three
// cards from their own graveyard — fewer if they like (the ruling) — Sail into
// the West's shape.

export default defineCard({
  name: "Ill-Gotten Gains",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile Ill-Gotten Gains. Each player discards their hand, then returns up to three cards from their graveyard to their hand.",
  exileOnResolve: true,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "each-player" },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          player: "that-player",
          min: 0,
          max: 3,
          destination: "hand",
          leftover: "stay",
        },
      },
    ],
  },
});
