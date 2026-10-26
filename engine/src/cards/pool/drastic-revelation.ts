import { defineCard } from "../define.js";

// The hand is discarded as part of the effect, not as a cost (its ruling), so
// an empty hand still draws seven.
export default defineCard({
  name: "Drastic Revelation",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["sorcery"],
  text: "Discard your hand. Draw seven cards, then discard three cards at random.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: 7 },
      { kind: "discard", target: "you", amount: 3, random: true },
    ],
  },
});
