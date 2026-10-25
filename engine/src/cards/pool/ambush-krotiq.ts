import { defineCard } from "../define.js";

// EDHREC rank 25394.
//
// Rulings:
//   [2014-11-24] The triggered ability doesn’t target any permanent. You choose which one to
//     return as the ability resolves. No player can respond to this choice once the ability starts
//     resolving.
//   [2014-11-24] If you control no other creatures as Ambush Krotiq’s triggered ability resolves,
//     nothing happens. Ambush Krotiq remains on the battlefield.

export default defineCard({
  name: "Ambush Krotiq",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, return another creature you control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        exceptSource: true,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return another creature you control to its owner's hand",
      },
      resolve: null,
      text: "When this creature enters, return another creature you control to its owner's hand.",
    },
  ],
});
