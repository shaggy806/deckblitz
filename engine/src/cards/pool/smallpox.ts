import { defineCard } from "../define.js";

// EDHREC rank 5424.
// Each instruction done by every player at once (the rulings): the life loss, the discards (each
// chosen face down), the creatures, then the lands — the sacrifices chosen in turn order.

export default defineCard({
  name: "Smallpox",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player loses 1 life, discards a card, sacrifices a creature of their choice, then sacrifices a land of their choice.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 1, who: "each-player" },
      { kind: "discard", target: "each-player", amount: 1 },
      { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
      { kind: "sacrifice", who: "each-player", filter: { type: "land" }, count: 1 },
    ],
  },
});
