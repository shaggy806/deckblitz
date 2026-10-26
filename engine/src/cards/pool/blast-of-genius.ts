import { defineCard } from "../define.js";

// Rulings: an illegal target means the spell doesn't resolve at all (no draw,
// no discard) — a single-target spell's normal fizzle. A discarded card's {X}
// counts as 0 — its mana value in the graveyard.

export default defineCard({
  name: "Blast of Genius",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Choose any target. Draw three cards, then discard a card. Blast of Genius deals damage equal to the discarded card's mana value to that permanent or player.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "discard", target: "you", amount: 1 },
      { kind: "damage", amount: { thisWay: "discarded", sumOf: "mana-value" }, target: 0 },
    ],
  },
});
