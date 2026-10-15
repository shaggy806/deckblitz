import { defineCard } from "../define.js";

// EDHREC rank 22742.

export default defineCard({
  name: "Coercion",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a card from it. That player discards that card.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0 },
});
