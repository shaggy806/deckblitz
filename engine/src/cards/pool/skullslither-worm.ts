import { defineCard } from "../define.js";

// EDHREC rank 22733.
//
// Refurbished Familiar's shape: each opponent discards, then for each one who
// discarded nothing (an empty hand), two +1/+1 counters.

const ETB_TEXT =
  "When this creature enters, each opponent discards a card. For each opponent who can't, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Skullslither Worm",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Worm"],
  power: 3,
  toughness: 3,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded", who: "that-player", atMost: 0 },
              then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
            },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
