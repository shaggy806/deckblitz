import { defineCard } from "../define.js";

// EDHREC rank 7008.
//
// Rulings:
//   [2015-02-25] The triggered ability doesn’t target any permanent. You choose which one to
//     return as the ability resolves. No player can respond to this choice once the ability starts
//     resolving.
//   [2015-02-25] Ancestral Statue’s ability is mandatory. If Ancestral Statue is the only nonland
//     permanent you control when its ability resolves, you must return it to its owner’s hand.

export default defineCard({
  name: "Ancestral Statue",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 4,
  text: "When this creature enters, return a nonland permanent you control to its owner's hand.",
  // Not targeted, chosen as it resolves, and mandatory — the Statue itself
  // when it's the only one (the rulings). Whitemane Lion's shape.
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { notTypes: ["land"], controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a nonland permanent you control to its owner's hand",
      },
      resolve: null,
      text: "When this creature enters, return a nonland permanent you control to its owner's hand.",
    },
  ],
});
