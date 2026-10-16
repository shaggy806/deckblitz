import { defineCard } from "../define.js";

// EDHREC rank 16189.
//
// Rulings:
//   [2023-11-10] While resolving In the Presence of Ages, you could put no cards, a creature card,
//     a land card, or a creature card and a land card into your hand.
//
// "A creature card and/or a land card" is two picks of up to one each: the
// creature card first, then a land card from the rest (`secondPick`), so a
// creature land can be either one and the other pick still has the rest.

export default defineCard({
  name: "In the Presence of Ages",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Reveal the top four cards of your library. You may put a creature card and/or a land card from among them into your hand. Put the rest into your graveyard.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: true,
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "hand",
    secondPick: { filter: { type: "land" }, min: 0, max: 1, destination: "hand" },
    leftover: "graveyard",
  },
});
