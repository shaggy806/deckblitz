import { defineCard } from "../define.js";

// EDHREC rank 14530. Poison the Waters' shape, word for word.

export default defineCard({
  name: "Divest",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You choose an artifact or creature card from it. That player discards that card.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, filter: { typesAnyOf: ["artifact", "creature"] } },
});
