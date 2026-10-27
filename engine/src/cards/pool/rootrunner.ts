import { defineCard } from "../define.js";

// EDHREC rank 28752.

export default defineCard({
  name: "Rootrunner",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: "{G}{G}, Sacrifice this creature: Put target land on top of its owner's library.\nSoulshift 3 (When this creature dies, you may return target Spirit card with mana value 3 or less from your graveyard to your hand.)",
  activated: [
    {
      cost: { mana: "{G}{G}", tap: false, sacrifice: "self" },
      targets: ["land"],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: "{G}{G}, Sacrifice this creature: Put target land on top of its owner's library.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Soulshift 3 (When this creature dies, you may return target Spirit card with mana value 3 or less from your graveyard to your hand.)",
    },
  ],
});
