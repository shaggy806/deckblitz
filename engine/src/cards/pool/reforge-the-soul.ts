import { defineCard } from "../define.js";

// EDHREC rank 1697.

export default defineCard({
  name: "Reforge the Soul",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  miracle: { cost: "{1}{R}" },
  text: "Each player discards their hand, then draws seven cards.\nMiracle {1}{R} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "each-player" },
      { kind: "draw", amount: 7, who: "each-player" },
    ],
  },
});
