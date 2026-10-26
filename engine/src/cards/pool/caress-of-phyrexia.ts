import { defineCard } from "../define.js";

// EDHREC rank 11253.

export default defineCard({
  name: "Caress of Phyrexia",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player draws three cards, loses 3 life, and gets three poison counters.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3, target: 0 },
      { kind: "lose-life", amount: 3, target: 0 },
      { kind: "add-player-counters", counter: "poison", amount: 3, target: 0 },
    ],
  },
});
