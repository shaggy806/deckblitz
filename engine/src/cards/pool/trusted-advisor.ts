import { defineCard } from "../define.js";

// EDHREC rank 21050.
//
// Rulings:
//   [2009-10-01] If multiple effects modify your hand size, apply them in timestamp order. For
//     example, if you put Null Profusion (an enchantment that says your maximum hand size is two)
//     onto the battlefield and then put Trusted Advisor onto the battlefield, your maximum hand
//     size will be four. However, if those permanents entered in the opposite order, your maximum
//     hand size would be two.
//
// `maxHandSize.adjust` applies in timestamp order with the other hand-size
// effects (the ruling). The upkeep return is Roaring Primadox's, blue only.
const HAND_TEXT = "Your maximum hand size is increased by two.";
const UPKEEP_TEXT = "At the beginning of your upkeep, return a blue creature you control to its owner's hand.";

export default defineCard({
  name: "Trusted Advisor",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 2,
  text: `${HAND_TEXT}\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, maxHandSize: { who: "you", adjust: 2 }, text: HAND_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", colors: ["U"], controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a blue creature you control to its owner's hand",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
