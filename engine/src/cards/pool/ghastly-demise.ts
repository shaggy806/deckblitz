import { defineCard } from "../define.js";

// EDHREC rank 16960.
//
// Rulings:
//   [2004-10-04] Because Ghastly Demise isn't put into your graveyard until it's finished
//     resolving, it won't be counted when determining whether the creature is destroyed.
//   [2004-10-04] Ghastly Demise can target any nonblack creature. Compare the creature's
//     toughness to the number of cards in your graveyard as Ghastly Demise resolves.

export default defineCard({
  name: "Ghastly Demise",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonblack creature if its toughness is less than or equal to the number of cards in your graveyard.",
  targets: ["nonblack-creature"],
  // Rending Vines' shape: the comparison is read as it resolves.
  effect: {
    kind: "conditional",
    condition: {
      kind: "target",
      index: 0,
      filter: { toughness: { op: "lte", n: { amount: { graveyardSize: "you" } } } },
    },
    then: { kind: "destroy", target: 0 },
  },
});
