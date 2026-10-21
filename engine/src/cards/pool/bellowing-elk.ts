import { defineCard } from "../define.js";

// EDHREC rank 26594.
//
// Rulings:
//   Bellowing Elk's effect checks each turn whether it applies during that turn. It doesn't check
//     only during the turn it enters the battlefield.
//   Bellowing Elk's effect applies even if the other creature entered the battlefield under your
//     control before Bellowing Elk entered the battlefield, and it continues to apply even if that
//     creature leaves the battlefield.
// Nimble Trapfinder's turn-history condition, over any creature.

const TEXT =
  "As long as you had another creature enter the battlefield under your control this turn, this creature has trample and indestructible.";

export default defineCard({
  name: "Bellowing Elk",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 4,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "creature" }, excludeSelf: true },
      grantKeywords: ["trample", "indestructible"],
      text: TEXT,
    },
  ],
});
