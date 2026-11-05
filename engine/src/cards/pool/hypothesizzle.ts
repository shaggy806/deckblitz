import { defineCard } from "../define.js";

// The target is chosen as the reflexive ability goes on the stack (the ruling).
export default defineCard({
  name: "Hypothesizzle",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Draw two cards. Then you may discard a nonland card. When you do, Hypothesizzle deals 4 damage to target creature.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "may",
        prompt: "Discard a nonland card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1, filter: { notTypes: ["land"] } },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "reflexive-trigger",
                targets: ["creature"],
                effect: { kind: "damage", amount: 4, target: 0 },
                text: "When you do, Hypothesizzle deals 4 damage to target creature.",
              },
            },
          ],
        },
      },
    ],
  },
});
