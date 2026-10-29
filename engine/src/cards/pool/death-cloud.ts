import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 10502.
//
// Smallpox's sequence at X. The lands are sacrificed after the creatures, so
// a creature land already sacrificed as a creature can't be sacrificed again
// (the ruling).
export default defineCard({
  name: "Death Cloud",
  manaCost: "{X}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player loses X life, discards X cards, sacrifices X creatures of their choice, then sacrifices X lands of their choice.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: "x", who: "each-player" },
      { kind: "discard", target: "each-player", amount: "x" },
      { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: "x" },
      { kind: "sacrifice", who: "each-player", filter: { type: "land" }, count: "x" },
    ],
  },
});
