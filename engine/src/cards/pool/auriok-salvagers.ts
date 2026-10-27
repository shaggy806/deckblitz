import { defineCard } from "../define.js";

// EDHREC rank 12305.
//
// Rulings:
//   [2020-08-07] If a card in a player's graveyard has {X} in its mana cost, X is considered to be
//     0.

const TEXT = "{1}{W}: Return target artifact card with mana value 1 or less from your graveyard to your hand.";

export default defineCard({
  name: "Auriok Salvagers",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "artifact", manaValue: { op: "lte", n: 1 } } },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
