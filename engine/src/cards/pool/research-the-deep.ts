import { defineCard } from "../define.js";

// Morningtide. Clash (rule 701.30); on a win the spell returns to its owner's hand as it
// finishes resolving (rule 608.2n), instead of going to the graveyard.

export default defineCard({
  name: "Research the Deep",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw a card. Clash with an opponent. If you win, return Research the Deep to its owner's hand. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  effect: { kind: "sequence", effects: [{ kind: "draw", amount: 1 }, { kind: "clash", won: { kind: "return-to-hand", target: "source", from: "stack" } }] },
});
