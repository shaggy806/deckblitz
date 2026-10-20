import { defineCard } from "../define.js";

// EDHREC rank 22574.
//
// Rulings:
//   [2022-02-18] You choose the creature or Vehicle to put counters on after the target opponent
//     reveals their hand and you've decided whether or not to choose a card.
//   [2022-02-18] You may cast Reckoner Shakedown even if you don't control any creatures or
//     Vehicles. If you end up not choosing a nonland card (probably because they don't reveal
//     any), nothing else happens.
//
// Oildeep Gearhulk's "you may choose … if you do" (an optional
// `discard-chosen`, then a `this-way` check); "if you don't" picks the
// creature or Vehicle as it resolves — not a target.
const TEXT =
  "Target opponent reveals their hand. You may choose a nonland card from it. If you do, that player discards that card. If you don't, put two +1/+1 counters on a creature or Vehicle you control.";

export default defineCard({
  name: "Reckoner Shakedown",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, optional: true },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "discarded", atMost: 0 },
        then: {
          kind: "choose-permanents",
          filter: { controlledBy: "you", anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
          min: 1,
          upTo: 1,
          prompt: "Choose a creature or Vehicle you control to put two +1/+1 counters on",
          then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
        },
      },
    ],
  },
});
