import { defineCard } from "../define.js";

// EDHREC rank 25327.

export default defineCard({
  name: "Moonlit Strider",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 4,
  text: "Sacrifice this creature: Target creature you control gains protection from the color of your choice until end of turn.\nSoulshift 3 (When this creature dies, you may return target Spirit card with mana value 3 or less from your graveyard to your hand.)",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Sacrifice this creature: Target creature you control gains protection from the color of your choice until end of turn.",
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
