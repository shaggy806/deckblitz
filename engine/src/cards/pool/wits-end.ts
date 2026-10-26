import { defineCard } from "../define.js";

// Dissension. EDHREC rank 21627. Tyrannize's "discards their hand" shape.

export default defineCard({
  name: "Wit's End",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards their hand.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: { cardsInHand: "each" } },
});
