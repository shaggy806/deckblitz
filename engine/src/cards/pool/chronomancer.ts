import { defineCard } from "../define.js";

export default defineCard({
  name: "Chronomancer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nAtomic Transmutation — {1}, {T}, Sacrifice another artifact: Draw a card.\nUnearth {2}{B} ({2}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Atomic Transmutation — {1}, {T}, Sacrifice another artifact: Draw a card.",
      otherOnly: true,
    },
    {
      cost: { mana: "{2}{B}", tap: false },
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
      text: "Unearth {2}{B}",
    },
  ],
});
