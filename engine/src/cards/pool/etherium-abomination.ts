import { defineCard } from "../define.js";

export default defineCard({
  name: "Etherium Abomination",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 3,
  text: "Unearth {1}{U}{B} ({1}{U}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}{U}{B}", tap: false },
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
      text: "Unearth {1}{U}{B}",
    },
  ],
});
