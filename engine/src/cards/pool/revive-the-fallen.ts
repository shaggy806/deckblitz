import { defineCard } from "../define.js";

// Morningtide. Clash (rule 701.30); on a win the spell returns to its owner's hand as it
// finishes resolving (rule 608.2n), instead of going to the graveyard.

export default defineCard({
  name: "Revive the Fallen",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from a graveyard to its owner's hand. Clash with an opponent. If you win, return Revive the Fallen to its owner's hand. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "return-to-hand", target: 0, from: "graveyard" }, { kind: "clash", won: { kind: "return-to-hand", target: "source", from: "stack" } }],
  },
});
