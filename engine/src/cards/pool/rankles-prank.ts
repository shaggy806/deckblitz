import { defineCard } from "../define.js";

// EDHREC rank 6808.
//
// Each mode is rule 101.4's: the discards are chosen face down in turn order
// from the active player and made at once; the sacrifices are chosen in turn
// order, each knowing the ones before, and made at once (the rulings).
export default defineCard({
  name: "Rankle's Prank",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one or more —\n• Each player discards two cards.\n• Each player loses 4 life.\n• Each player sacrifices two creatures of their choice.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 3,
    modes: [
      { text: "Each player discards two cards.", targets: [], effect: { kind: "discard", target: "each-player", amount: 2 } },
      { text: "Each player loses 4 life.", targets: [], effect: { kind: "lose-life", amount: 4, who: "each-player" } },
      {
        text: "Each player sacrifices two creatures of their choice.",
        targets: [],
        effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 2 },
      },
    ],
  },
});
