import { defineCard } from "../define.js";

export default defineCard({
  name: "Torii Watchward",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance (Attacking doesn't cause this creature to tap.)\nSoulshift 4 (When this creature dies, you may return target Spirit card with mana value 4 or less from your graveyard to your hand.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 4 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Soulshift 4 (When this creature dies, you may return target Spirit card with mana value 4 or less from your graveyard to your hand.)",
    },
  ],
});
