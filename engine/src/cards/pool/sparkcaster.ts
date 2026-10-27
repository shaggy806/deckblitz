import { defineCard } from "../define.js";

// EDHREC rank 27462.
//
// Rulings:
//   [2004-10-04] It probably won't matter much, but you choose the order in which the two
//     triggered abilities are placed on the stack.
//   [2004-10-04] You choose the creature to return on resolution of the triggered ability. This is
//     not targeted.

export default defineCard({
  name: "Sparkcaster",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 5,
  toughness: 3,
  text: "When this creature enters, return a red or green creature you control to its owner's hand.\nWhen this creature enters, it deals 1 damage to target player or planeswalker.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a red or green creature you control to its owner's hand",
      },
      resolve: null,
      text: "When this creature enters, return a red or green creature you control to its owner's hand.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 1 damage to target player or planeswalker.",
    },
  ],
});
