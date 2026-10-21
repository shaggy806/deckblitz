import { defineCard } from "../define.js";

// EDHREC rank 24186.
//
// Rulings:
//   [2019-07-12] The number of creatures you control is counted as Gruesome Scourger's ability
//     resolves. If Gruesome Scourger is still on the battlefield, it will count itself.

const ENTERS =
  "When this creature enters, it deals damage to target opponent or planeswalker equal to the number of creatures you control.";

export default defineCard({
  name: "Gruesome Scourger",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 3,
  toughness: 3,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: ENTERS,
    },
  ],
});
