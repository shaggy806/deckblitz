import { defineCard } from "../define.js";

// EDHREC rank 15450. Zero, one or two targets; the discard happens whatever was
// chosen and may be a returned card (the rulings) — Macabre Waltz's shape, with
// Reconstruct History's one-per-type slots and its "Exile ~".
export default defineCard({
  name: "Shreds of Sanity",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Return up to one target instant card and up to one target sorcery card from your graveyard to your hand, then discard a card. Exile Shreds of Sanity.",
  targets: [
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "instant" } } },
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "sorcery" } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      { kind: "discard", target: "you", amount: 1 },
    ],
  },
  exileOnResolve: true,
});
