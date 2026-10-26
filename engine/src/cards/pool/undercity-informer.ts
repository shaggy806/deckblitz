import { defineCard } from "../define.js";

// EDHREC rank 13425. Consuming Aberration's reveal, for a target player: the
// land found stays with the rest, so every revealed card goes to the graveyard.
//
// Rulings:
//   [2013-01-24] If the target player has no land cards in their library, all cards from that
//     library will be revealed and put into their graveyard.

const TEXT =
  "{1}, Sacrifice a creature: Target player reveals cards from the top of their library until they reveal a land card, then puts those cards into their graveyard.";

export default defineCard({
  name: "Undercity Informer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: ["player"],
      effect: { kind: "reveal-until", whose: 0, filter: { type: "land" }, rest: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
