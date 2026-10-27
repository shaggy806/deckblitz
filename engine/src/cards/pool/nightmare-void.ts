import { defineCard } from "../define.js";

// Rulings:
//   [2014-02-01] If you target yourself with this spell, you must reveal your entire hand to the
//     other players just as any other player would.
//   [2024-01-12] You can't attempt to use a dredge ability if you don't have enough cards in your
//     library.
//   [2024-01-12] One card draw can't be replaced by multiple dredge abilities.

export default defineCard({
  name: "Nightmare Void",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You choose a card from it. That player discards that card.\nDredge 2 (If you would draw a card, you may mill two cards instead. If you do, return this card from your graveyard to your hand.)",
  dredge: 2,
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0 },
});
