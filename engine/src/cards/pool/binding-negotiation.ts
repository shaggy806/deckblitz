import { defineCard } from "../define.js";

// "Otherwise" is having discarded nothing, by choice or for want of a nonland
// card. The exile choice is untargeted and offers only the cards that opponent
// owns, face up (`faceDown: false`), each going to its owner's graveyard.
const TEXT =
  "Target opponent reveals their hand. You may choose a nonland card from it. If you do, they discard it. Otherwise, you may put a face-up exiled card they own into their graveyard.";

export default defineCard({
  name: "Binding Negotiation",
  manaCost: "{1}{B}",
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
        condition: { kind: "this-way", what: "discarded", atLeast: 1 },
        then: { kind: "sequence", effects: [] },
        else: {
          kind: "look-and-choose",
          zone: "exile",
          from: { target: 0 },
          filter: { faceDown: false },
          min: 0,
          max: 1,
          destination: "graveyard",
          leftover: "stay",
        },
      },
    ],
  },
});
