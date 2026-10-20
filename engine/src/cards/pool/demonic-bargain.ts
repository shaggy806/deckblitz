import { defineCard } from "../define.js";

// EDHREC rank 14641.
//
// Rulings:
//   [2021-11-19] If there are any cards left in your library as you search, you must choose one of
//     them.
//   [2021-11-19] If there are thirteen or fewer cards remaining in your library as this spell
//     begins to resolve, you will exile your entire library. You won't put any cards into your
//     hand.
//   [2021-11-19] You do not have to reveal the card you find. That's not part of the bargain.
//   [2021-11-19] The thirteen cards remain in exile. That's part of the bargain.
//
// A plain exile from the top (no permission to play them), then Demonic
// Tutor's search: `min: 1` for "a card", clamped to what's left.

export default defineCard({
  name: "Demonic Bargain",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile the top thirteen cards of your library, then search your library for a card. Put that card into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-from-library", amount: 13 },
      { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
    ],
  },
});
