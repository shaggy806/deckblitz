import { defineCard } from "../define.js";

// EDHREC rank 20538.
//
// Rulings:
//   [2014-11-24] Other players won't know whether the card you manifest is the top card or second
//     card of that library.
//   [2014-11-24] If you're playing with the top card of your library revealed, you'll manifest one
//     of the cards, then the other one will be revealed, then you can choose to put that card on
//     the bottom of your library or leave it on top.

export default defineCard({
  name: "Write into Being",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top two cards of your library. Manifest one of those cards, then put the other on the top or bottom of your library. (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  targets: [],
  // Manifest one (manifest dread's first half), then the other goes to the
  // bottom if it's picked second, or stays on top if not.
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 2,
    min: 1,
    max: 1,
    destination: "manifest",
    secondPick: { min: 0, max: 1, destination: "library-bottom" },
    leftover: "stay",
  },
});
