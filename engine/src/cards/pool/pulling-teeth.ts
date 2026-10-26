import { defineCard } from "../define.js";

// Morningtide. Clash (rule 701.30); "that player" is the target player either way.

export default defineCard({
  name: "Pulling Teeth",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Clash with an opponent. If you win, target player discards two cards. Otherwise, that player discards a card. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  targets: ["player"],
  effect: {
    kind: "clash",
    won: { kind: "discard", target: 0, amount: 2 },
    lost: { kind: "discard", target: 0, amount: 1 },
  },
});
