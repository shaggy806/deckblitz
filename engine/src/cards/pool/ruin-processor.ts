import { defineCard } from "../define.js";

// EDHREC rank 19141.

export default defineCard({
  name: "Ruin Processor",
  manaCost: "{7}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 7,
  toughness: 8,
  text: "When you cast this spell, you may put a card an opponent owns from exile into that player's graveyard. If you do, you gain 5 life.",
  triggered: [
    {
      trigger: { on: "this-cast" },
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
              then: { kind: "gain-life", amount: 5 },
            },
          ],
        },
      },
      resolve: null,
      text: "When you cast this spell, you may put a card an opponent owns from exile into that player's graveyard. If you do, you gain 5 life.",
    },
  ],
});
