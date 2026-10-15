import { defineCard } from "../define.js";

// EDHREC rank 9206.
//
// Rulings:
//   [2014-02-01] If you target yourself with this spell, you must reveal your entire hand to the
//     other players just as any other player would.

export default defineCard({
  name: "Inquisition of Kozilek",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You choose a nonland card from it with mana value 3 or less. That player discards that card.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"], manaValue: { op: "lte", n: 3 } } },
});
