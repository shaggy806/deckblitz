import { defineCard } from "../define.js";

// EDHREC rank 18250. Salvage Drone's "you may draw a card. If you do, discard
// a card"; it triggers on another creature dying at the same time as it (its
// ruling — a leaves-the-battlefield trigger looks back).

const TEXT = "Whenever another creature dies, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Murder of Crows",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "drawn", who: "you" },
              then: { kind: "discard", target: "you", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
