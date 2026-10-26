import { defineCard } from "../define.js";

// Morningtide. Clash (rule 701.30); on a win the spell returns to its owner's hand as it
// finishes resolving (rule 608.2n), instead of going to the graveyard.

export default defineCard({
  name: "Release the Ants",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Release the Ants deals 1 damage to any target. Clash with an opponent. If you win, return Release the Ants to its owner's hand. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  targets: ["any-target"],
  effect: { kind: "sequence", effects: [{ kind: "damage", amount: 1, target: 0 }, { kind: "clash", won: { kind: "return-to-hand", target: "source", from: "stack" } }] },
});
