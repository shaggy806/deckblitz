import { defineCard } from "../define.js";

// EDHREC rank 12190.
//
// Rulings:
//   [2004-12-01] If a Beacon is countered or doesn't resolve, it's put into its owner's
//     graveyard, not shuffled into the library.

export default defineCard({
  name: "Beacon of Creation",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 1/1 green Insect creature token for each Forest you control. Shuffle Beacon of Creation into its owner's library.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Insect Token",
    count: { countOf: { type: "land", subtype: "Forest", controlledBy: "you" } },
  },
  // Only on resolving: a countered Beacon goes to the graveyard (the ruling).
  shuffleIntoLibraryOnResolve: true,
});
