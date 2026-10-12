import { defineCard } from "../define.js";

export default defineCard({
  name: "Hellspark Elemental",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 1,
  keywords: ["trample", "haste"],
  text: "Trample, haste\nAt the beginning of the end step, sacrifice this creature.\nUnearth {1}{R} ({1}{R}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source", exileIfItWouldLeave: true },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "exile", target: "source" },
            text: "Exile the unearthed card.",
          },
        ],
      },
      resolve: null,
      text: "Unearth {1}{R}",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, sacrifice this creature.",
    },
  ],
});
