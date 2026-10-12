import { defineCard } from "../define.js";

export default defineCard({
  name: "Tocasia's Onulet",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  text: "When this creature leaves the battlefield, you gain 2 life.\nUnearth {3}{W} ({3}{W}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
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
      text: "Unearth {3}{W}",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "When this creature leaves the battlefield, you gain 2 life.",
    },
  ],
});
