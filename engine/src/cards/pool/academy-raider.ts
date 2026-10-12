import { defineCard } from "../define.js";

export default defineCard({
  name: "Academy Raider",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["intimidate"],
  text: "Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\nWhenever this creature deals combat damage to a player, you may discard a card. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
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
      text: "Whenever this creature deals combat damage to a player, you may discard a card. If you do, draw a card.",
    },
  ],
});
