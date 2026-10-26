import { defineCard } from "../define.js";

// EDHREC rank 27671.

export default defineCard({
  name: "Deathknell Kami",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{2}: This creature gets +1/+1 until end of turn. Sacrifice it at the beginning of the next end step.\nSoulshift 1 (When this creature dies, you may return target Spirit card with mana value 1 or less from your graveyard to your hand.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      // Pyric Salamander's shape: the pump, then the delayed sacrifice of the source.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            text: "Sacrifice Deathknell Kami.",
            effect: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: "{2}: This creature gets +1/+1 until end of turn. Sacrifice it at the beginning of the next end step.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 1 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Soulshift 1 (When this creature dies, you may return target Spirit card with mana value 1 or less from your graveyard to your hand.)",
    },
  ],
});
