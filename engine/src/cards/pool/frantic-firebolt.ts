import { defineCard } from "../define.js";

// EDHREC rank 13798.
//
// Rulings:
//   [2023-09-01] Frantic Firebolt isn't put into your graveyard until after it finishes resolving,
//     so it doesn't count itself for its own effect.

export default defineCard({
  name: "Frantic Firebolt",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Frantic Firebolt deals X damage to target creature, where X is 2 plus the number of cards in your graveyard that are instant cards, sorcery cards, and/or have an Adventure.",
  targets: ["creature"],
  // X is counted as it resolves (rule 608.2h) — Frantic Firebolt itself is
  // still on the stack, not in the graveyard.
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      sum: [
        2,
        { countInGraveyard: { ownedBy: "you", anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { hasAdventure: true }] } },
      ],
    },
  },
});
