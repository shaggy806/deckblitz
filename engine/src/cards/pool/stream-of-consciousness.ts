import { defineCard } from "../define.js";

// EDHREC rank 19782.
//
// Rulings:
//   [2005-02-01] Stream of Consciousness can't be one of the target cards you shuffle into your
//     library.
//   [2005-02-01] You may target zero cards in any graveyard and have a target player simply
//     shuffle their library.
//   [2005-02-01] If you target any cards in a graveyard and those cards all become illegal
//     targets, the target player simply shuffles their library.
//   [2005-02-01] You choose the target cards; the target player doesn't.
//
// Dwell on the Past's shape.
export default defineCard({
  name: "Stream of Consciousness",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Target player shuffles up to four target cards from their graveyard into their library.",
  targets: [
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 4, sameController: { slot: 0 } },
  ],
  effect: {
    kind: "conditional",
    condition: { kind: "target-legal", index: 0 },
    then: {
      kind: "sequence",
      effects: [
        {
          kind: "for-each-target",
          from: 1,
          simultaneous: true,
          effect: { kind: "put-on-library", target: 1, position: "top" },
        },
        { kind: "shuffle-library", target: 0 },
      ],
    },
  },
});
