import { defineCard } from "../define.js";

// Commander 2021 (C21). Tether Technician's shape: no card discarded, no
// reflexive trigger (the first ruling). X — the card types of the discarded
// card (the second ruling: supertypes and subtypes aren't) — is known only to
// this resolution, so the reflexive ability carries it as its `value`.
const TEXT =
  "At the beginning of combat on your turn, you may discard a card. When you do, this creature deals X damage to any target, where X is the number of card types the discarded card has.";

export default defineCard({
  name: "Mount Velus Manticore",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Manticore"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "reflexive-trigger",
                targets: ["any-target"],
                value: { thisWay: "discarded", cardTypes: true },
                effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
                text: "When you do, this creature deals X damage to any target, where X is the number of card types the discarded card has.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
