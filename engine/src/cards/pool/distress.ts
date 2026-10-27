import { defineCard } from "../define.js";

// Champions of Kamigawa. Thoughtseize without the life loss.
//
// Rulings:
//   If you target yourself with this spell, you must reveal your entire hand to the other
//   players just as any other player would.

export default defineCard({
  name: "Distress",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You choose a nonland card from it. That player discards that card.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
});
