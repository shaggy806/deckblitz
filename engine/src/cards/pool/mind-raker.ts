import { defineCard } from "../define.js";

// EDHREC rank 24994.

export default defineCard({
  name: "Mind Raker",
  manaCost: "{3}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 3,
  toughness: 3,
  text: "Devoid (This card has no color.)\nWhen this creature enters, you may put a card an opponent owns from exile into that player's graveyard. If you do, each opponent discards a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a card an opponent owns from exile into their graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "exile",
              filter: { ownedBy: "opponent" },
              min: 1,
              max: 1,
              destination: "graveyard",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "chosen" },
              then: { kind: "discard", target: "each-opponent", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, you may put a card an opponent owns from exile into that player's graveyard. If you do, each opponent discards a card.",
    },
  ],
});
