import { defineCard } from "../define.js";

// EDHREC rank 10647.
//
// The granted dies trigger looks back in time (rule 603.10a): the Cleric
// that was the condition dying, or sacrificed to pay for the first ability,
// still triggers it (the rulings), and once triggered it resolves without a
// Cleric.
const GRANTED_TEXT = "Whenever a creature you control dies, each opponent loses 1 life and you gain 1 life.";
const STATIC_TEXT = `As long as you control a Cleric, this artifact has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Relic Vial",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{2}, {T}, Sacrifice a creature: Draw a card.\n${STATIC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, {T}, Sacrifice a creature: Draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Cleric" }, atLeast: 1 },
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "lose-life", amount: 1, who: "each-opponent" },
              { kind: "gain-life", amount: 1 },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
