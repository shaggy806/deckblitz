import { defineCard } from "../define.js";

// EDHREC rank 12503.

export default defineCard({
  name: "Akki Ronin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Samurai"],
  power: 1,
  toughness: 3,
  text: "Whenever a Samurai or Warrior you control attacks alone, you may discard a card. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: "Whenever a Samurai or Warrior you control attacks alone, you may discard a card. If you do, draw a card.",
    },
  ],
});
