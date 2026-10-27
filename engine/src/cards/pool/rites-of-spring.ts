import { defineCard } from "../define.js";

// EDHREC rank 17794.
//
// Rulings:
//   [2004-10-04] You can choose to find fewer basic land cards if you want to.

export default defineCard({
  name: "Rites of Spring",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Discard any number of cards. Search your library for up to that many basic land cards, reveal them, put them into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 0, anyNumber: true },
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        reveal: true,
        min: 0,
        max: { thisWay: "discarded" },
      },
    ],
  },
});
