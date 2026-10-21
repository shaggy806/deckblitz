import { defineCard } from "../define.js";

// EDHREC rank 29425. Throne of Eldraine.
//
// Rulings:
//   [2019-10-04] If that player has one card in hand, it's discarded at random (even though
//     that's not very random). The player draws a card.
//
// Hypnotic Specter's trigger, then "if the player does" — a card discarded
// this way — that player draws.

const TRIGGER_TEXT =
  "Whenever this creature deals damage to an opponent, that player discards a card at random. If the player does, they draw a card.";

export default defineCard({
  name: "Skullknocker Ogre",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 4,
  toughness: 3,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "trigger-player", amount: 1, random: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded" },
            then: { kind: "draw", amount: 1, who: "trigger-player" },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
