import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 22034.
//
// Rulings:
//   [2004-10-04] Because the “search” requires you to find a card with certain characteristics,
//     you don’t have to find the card if you don’t want to.
//   [2013-01-24] If the target land is an illegal target when Frenzied Tilling tries to resolve,
//     the spell won’t resolve and none of its effects will happen. You won’t search your library
//     for a basic land card.
export default defineCard({
  name: "Frenzied Tilling",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Destroy target land. Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
    ],
  },
});
