import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloudpiercer",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 4,
  keywords: ["reach"],
  mutate: "{3}{R}",
  text: "Mutate {3}{R} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nReach\nWhenever this creature mutates, you may discard a card. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
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
      text: "Whenever this creature mutates, you may discard a card. If you do, draw a card.",
    },
  ],
});
