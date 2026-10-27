import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 29466. Coercion narrowed to an artifact card.

export default defineCard({
  name: "Shattered Dreams",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose an artifact card from it. That player discards that card.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { type: "artifact" } },
});
