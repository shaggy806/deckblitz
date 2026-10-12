import { defineCard } from "../define.js";

export default defineCard({
  name: "Vithian Stinger",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 0,
  toughness: 1,
  text: "{T}: This creature deals 1 damage to any target.\nUnearth {1}{R} ({1}{R}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to any target.",
    },
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
});
