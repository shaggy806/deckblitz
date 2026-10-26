import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 23845.
//
// Rulings:
//   [2012-05-01] The number of Humans you control is counted when the "enters" ability resolves.

const TEXT =
  "When this creature enters, it deals damage to target player or planeswalker equal to the number of Humans you control.";

export default defineCard({
  name: "Kessig Malcontents",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "damage",
        target: 0,
        amount: { countOf: { type: "creature", subtype: "Human", controlledBy: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
