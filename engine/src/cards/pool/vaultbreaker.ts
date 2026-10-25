import { defineCard } from "../define.js";

// EDHREC rank 25174. Fate Reforged.

export default defineCard({
  name: "Vaultbreaker",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Rogue"],
  power: 4,
  toughness: 2,
  dash: { cost: "{2}{R}" },
  text: "Whenever this creature attacks, you may discard a card. If you do, draw a card.\nDash {2}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may discard a card. If you do, draw a card.",
    },
  ],
});
