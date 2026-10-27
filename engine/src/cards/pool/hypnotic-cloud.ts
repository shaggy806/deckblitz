import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29394.
//
// Kicked, the player discards three cards instead of one.

export default defineCard({
  name: "Hypnotic Cloud",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {4} (You may pay an additional {4} as you cast this spell.)\nTarget player discards a card. If this spell was kicked, that player discards three cards instead.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 1 },
  kicker: {
    cost: "{4}",
    effect: { kind: "discard", target: 0, amount: 3 },
  },
});
