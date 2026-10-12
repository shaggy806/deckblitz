import { defineCard } from "../define.js";

export default defineCard({
  name: "Ecstatic Electromancer",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 2,
  toughness: 3,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhenever this creature enters or attacks, you may discard a card. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
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
      text: "Whenever this creature enters or attacks, you may discard a card. If you do, draw a card.",
    },
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
      text: "Whenever this creature enters or attacks, you may discard a card. If you do, draw a card.",
    },
  ],
});
