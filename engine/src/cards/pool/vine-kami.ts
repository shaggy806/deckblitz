import { defineCard } from "../define.js";

// EDHREC rank 28138.

export default defineCard({
  name: "Vine Kami",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nSoulshift 6 (When this creature dies, you may return target Spirit card with mana value 6 or less from your graveyard to your hand.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 6 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Soulshift 6 (When this creature dies, you may return target Spirit card with mana value 6 or less from your graveyard to your hand.)",
    },
  ],
});
