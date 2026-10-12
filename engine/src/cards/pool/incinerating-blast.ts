import { defineCard } from "../define.js";

export default defineCard({
  name: "Incinerating Blast",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Incinerating Blast deals 6 damage to target creature.\nYou may discard a card. If you do, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      {
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
    ],
  },
});
