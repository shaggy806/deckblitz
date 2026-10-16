import { defineCard } from "../define.js";

// EDHREC rank 14382.
//
// "If you discarded a card this way" asks about this controller's own
// discard only (`who: "you"`), after every player has discarded.
const TEXT = "When this creature enters, each player discards a card. If you discarded a card this way, draw a card.";

export default defineCard({
  name: "Fanatic of the Harrowing",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-player", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", who: "you" },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
