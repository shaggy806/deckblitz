import { defineCard } from "../define.js";

export default defineCard({
  name: "Null Group Biological Assets",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mutant", "Mercenary"],
  power: 3,
  toughness: 1,
  text: "During your turn, this creature has first strike.\nWhenever this creature attacks, you may discard a card. If you do, draw a card.",
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
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "During your turn, this creature has first strike.",
    },
  ],
});
