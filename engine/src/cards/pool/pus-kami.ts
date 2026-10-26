import { defineCard } from "../define.js";

export default defineCard({
  name: "Pus Kami",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: "{B}, Sacrifice this creature: Destroy target nonblack creature.\nSoulshift 6 (When this creature dies, you may return target Spirit card with mana value 6 or less from your graveyard to your hand.)",
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{B}, Sacrifice this creature: Destroy target nonblack creature.",
    },
  ],
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
