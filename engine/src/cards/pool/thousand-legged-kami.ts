import { defineCard } from "../define.js";

// EDHREC rank 27329.

export default defineCard({
  name: "Thousand-legged Kami",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 6,
  toughness: 6,
  text: "Soulshift 7 (When this creature dies, you may return target Spirit card with mana value 7 or less from your graveyard to your hand.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 7 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Soulshift 7 (When this creature dies, you may return target Spirit card with mana value 7 or less from your graveyard to your hand.)",
    },
  ],
});
