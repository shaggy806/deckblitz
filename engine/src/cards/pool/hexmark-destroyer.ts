import { defineCard } from "../define.js";

// EDHREC rank 14711.

export default defineCard({
  name: "Hexmark Destroyer",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 6,
  toughness: 6,
  text: "Multi-threat Eliminator — This creature can't be blocked except by six or more creatures.\nUnearth {4}{B}{B} ({4}{B}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{4}{B}{B}", tap: false },
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
            at: { step: "end" },
            effect: { kind: "exile", target: "source" },
            text: "Exile the unearthed card.",
          },
        ],
      },
      resolve: null,
      text: "Unearth {4}{B}{B}",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", byFewerThan: 6 }],
      text: "Multi-threat Eliminator — This creature can't be blocked except by six or more creatures.",
    },
  ],
});
