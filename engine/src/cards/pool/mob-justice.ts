import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 9687.
//
// Rulings:
//   [2004-10-04] Creatures are counted on resolution.

export default defineCard({
  name: "Mob Justice",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Mob Justice deals damage to target player or planeswalker equal to the number of creatures you control.",
  targets: ["player-or-planeswalker"],
  effect: { kind: "damage", amount: { countOf: { type: "creature", controlledBy: "you" } }, target: 0 },
});
