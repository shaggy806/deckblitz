import { defineCard } from "../define.js";

// EDHREC rank 7504.
//
// Rulings:
//   [2024-07-26] If you control creatures other than Mistbreath Elder as its triggered ability
//     resolves, you must return one of them to its owner's hand. If you don't, you have the option
//     to return Mistbreath Elder to its owner's hand or leave it on the battlefield and have the
//     ability do nothing.

// The return is a choice as it resolves, not a target (Arid Archway's shape):
// mandatory whenever there's another creature; "if you do" is whether one was
// returned this way.
const UPKEEP =
  "At the beginning of your upkeep, return another creature you control to its owner's hand. If you do, put a +1/+1 counter on this creature. Otherwise, you may return this creature to its owner's hand.";

export default defineCard({
  name: "Mistbreath Elder",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Warrior"],
  power: 2,
  toughness: 2,
  text: UPKEEP,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 1,
            upTo: 1,
            exceptSource: true,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return another creature you control to its owner's hand",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            else: {
              kind: "may",
              prompt: "Return Mistbreath Elder to its owner's hand?",
              effect: { kind: "return-to-hand", target: "source" },
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
