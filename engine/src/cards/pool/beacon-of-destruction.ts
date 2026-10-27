import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 18624.
//
// Rulings:
//   If a Beacon is countered or doesn't resolve, it's put into its owner's
//     graveyard, not shuffled into the library (`shuffleIntoLibraryOnResolve`
//     acts only as it resolves).

export default defineCard({
  name: "Beacon of Destruction",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Beacon of Destruction deals 5 damage to any target. Shuffle Beacon of Destruction into its owner's library.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 5, target: 0 },
  shuffleIntoLibraryOnResolve: true,
});
