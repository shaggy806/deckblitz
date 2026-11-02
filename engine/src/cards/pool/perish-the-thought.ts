import { defineCard } from "../define.js";

// Shuffling a card in is putting it there and shuffling: nothing sees between.

export default defineCard({
  name: "Perish the Thought",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a card from it. That player shuffles that card into their library.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, destination: "library-top" },
      { kind: "shuffle-library", target: 0 },
    ],
  },
});
