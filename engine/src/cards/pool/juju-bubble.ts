import { defineCard } from "../define.js";

// Rulings:
//   It does not matter if the card is played from your hand or from somewhere else.
//
// "Play a card" is playing a land or casting a spell (rules 305.1, 601.2) —
// the `plays-card` trigger, from any zone.

const CU_TEXT =
  "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";

export default defineCard({
  name: "Juju Bubble",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${CU_TEXT}\nWhen you play a card, sacrifice this artifact.\n{2}: You gain 1 life.`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "{2}: You gain 1 life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "age", amount: 1 },
            {
              kind: "unless",
              chooser: "you",
              options: [
                {
                  pay: "{1}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {1} for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: CU_TEXT,
    },
    {
      trigger: { on: "plays-card", who: "you" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you play a card, sacrifice this artifact.",
    },
  ],
});
