import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 32132. The discarding player chooses which cards.

export default defineCard({
  name: "Mind Burst",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards X cards, where X is one plus the number of cards named Mind Burst in all graveyards.",
  targets: ["player"],
  effect: {
    kind: "discard",
    target: 0,
    amount: { sum: [1, { countInGraveyard: { name: "Mind Burst" } }] },
  },
});
