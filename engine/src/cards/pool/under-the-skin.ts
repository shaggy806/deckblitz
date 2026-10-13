import { defineCard } from "../define.js";

// EDHREC rank 9623.
//
// Rulings:
//   [2024-09-20] The permanent card can be one you milled while manifesting dread, but it doesn't
//     have to be.

// The return isn't targeted: the card is chosen as it resolves, after the
// manifest, so the card manifest dread put into the graveyard is a candidate.
export default defineCard({
  name: "Under the Skin",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)\nYou may return a permanent card from your graveyard to your hand.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "manifest-dread" },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
      },
    ],
  },
});
