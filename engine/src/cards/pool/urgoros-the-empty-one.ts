import { defineCard } from "../define.js";

// EDHREC rank 19395. Dominaria.
//
// Rulings:
//   [2018-04-27] If that player has one card in hand, it's discarded at random (even though that's
//     not very random). You won't draw a card.
//
// "If the player can't" — they had no card to discard, so none was
// discarded this way.

const TEXT =
  "Whenever Urgoros deals combat damage to a player, that player discards a card at random. If the player can't, you draw a card.";

export default defineCard({
  name: "Urgoros, the Empty One",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "trigger-player", amount: 1, random: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", atMost: 0 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
