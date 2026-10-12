import { defineCard } from "../define.js";

export default defineCard({
  name: "Reconstructed Thopter",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nUnearth {2} ({2}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
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
      text: "Unearth {2}",
    },
  ],
});
