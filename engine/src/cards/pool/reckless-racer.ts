import { defineCard } from "../define.js";

// EDHREC rank 23052.
//
// Hangar Scrounger's rummage trigger.
//
// Rulings:
//   [2017-02-09] For the ability to trigger, Reckless Racer has to actually change from untapped to
//     tapped. If an effect attempts to tap it, but it was already tapped at the time, this ability
//     won't trigger.

const TAPPED_TEXT = "Whenever this creature becomes tapped, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Reckless Racer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${TAPPED_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: TAPPED_TEXT,
    },
  ],
});
