import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] At the beginning of combat on your turn, Boundary Lands Ranger's ability will
//     check to see if you control a creature with power 4 or greater. If you don't, the ability
//     won't trigger at all. If the ability does trigger, it will check again as it tries to
//     resolve.
// The intervening-if is the trigger's `condition` (checked as it fires and as it resolves —
// rule 603.4, Drumhunter); the rest is Improvised Act's "you may discard a card. If you do".

const TEXT =
  "At the beginning of combat on your turn, if you control a creature with power 4 or greater, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Boundary Lands Ranger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
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
      text: TEXT,
    },
  ],
});
