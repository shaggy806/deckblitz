import { defineCard } from "../define.js";

// EDHREC rank 18855.
// Makes Elemental → "Elemental Token (3/3 Blue-Red Flying)".
//
// The discard ability is Elemental Masterpiece's: activated from the hand,
// discarding this card as part of its cost.
//
// Rulings:
//   [2026-03-20] If there is only one card in your library, you put it into your hand.

export default defineCard({
  name: "Visionary's Dance",
  manaCost: "{5}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Create two 3/3 blue and red Elemental creature tokens with flying.\n{2}, Discard this card: Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.",
  effect: { kind: "create-token", token: "Elemental Token (3/3 Blue-Red Flying)", count: 2 },
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: "{2}, Discard this card: Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.",
      zone: "hand",
    },
  ],
});
