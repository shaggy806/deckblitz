import { defineCard } from "../define.js";

// Rulings:
//   [2012-07-01] Roaring Primadox's ability is mandatory. When it resolves, if Roaring Primadox is
//     the only creature you control, you must return it to its owner's hand.
//   [2014-07-18] The ability doesn't target any creature. You choose which one to return when the
//     ability resolves.

export default defineCard({
  name: "Roaring Primadox",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: "At the beginning of your upkeep, return a creature you control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a creature you control to its owner's hand",
      },
      resolve: null,
      text: "At the beginning of your upkeep, return a creature you control to its owner's hand.",
    },
  ],
});
