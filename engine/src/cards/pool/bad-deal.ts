import { defineCard } from "../define.js";

// You draw two however many opponents you have; each opponent discards two
// (one with a single card discards it); then everyone, you included, loses 2.
export default defineCard({
  name: "Bad Deal",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You draw two cards and each opponent discards two cards. Each player loses 2 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "discard", target: "each-opponent", amount: 2 },
      { kind: "lose-life", amount: 2, who: "each-player" },
    ],
  },
});
