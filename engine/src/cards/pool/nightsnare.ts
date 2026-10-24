import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 27291.
//
// Rulings:
//   [2015-06-22] If you don't choose a nonland card for the player to discard, that player chooses
//     which two cards they will discard.
//
// Reckoner Shakedown's optional `discard-chosen`, then a `this-way` check:
// with nothing discarded that way, the opponent discards two of their choice.
export default defineCard({
  name: "Nightsnare",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You may choose a nonland card from it. If you do, that player discards that card. If you don't, that player discards two cards.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, optional: true },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "discarded", atMost: 0 },
        then: { kind: "discard", target: 0, amount: 2 },
      },
    ],
  },
});
