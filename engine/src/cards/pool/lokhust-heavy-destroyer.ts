import { defineCard } from "../define.js";

export default defineCard({
  name: "Lokhust Heavy Destroyer",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nEnmitic Exterminator — When this creature enters, each player sacrifices a creature of their choice.\nUnearth {5}{B}{B}{B} ({5}{B}{B}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{5}{B}{B}{B}", tap: false },
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
      text: "Unearth {5}{B}{B}{B}",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "Enmitic Exterminator — When this creature enters, each player sacrifices a creature of their choice.",
    },
  ],
});
