import { defineCard } from "../define.js";

// EDHREC rank 31173.
//
// Rulings:
//   [2007-05-01] If the player has zero or one card left in their library, the card is put on the
//     bottom of that library.
//   [2014-02-01] If you target yourself with this spell, you must reveal your entire hand to the
//     other players just as any other player would.
//
// Painful Memories' choice, put third from the top (`libraryFromTop`): beneath
// the top two cards, or on the bottom of a library with fewer.
export default defineCard({
  name: "Lost Hours",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Target player reveals their hand. You choose a nonland card from it. That player puts that card into their library third from the top.",
  targets: ["player"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { notTypes: ["land"] },
    destination: "library-top",
    libraryFromTop: 3,
  },
});
