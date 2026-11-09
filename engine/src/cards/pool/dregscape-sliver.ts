import { defineCard } from "../define.js";

// EDHREC rank 10597.

export default defineCard({
  name: "Dregscape Sliver",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "Each Sliver creature card in your graveyard has unearth {2}.\nUnearth {2} ({2}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
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
            at: { step: "end" },
            effect: { kind: "exile", target: "source" },
            text: "Exile the unearthed card.",
          },
        ],
      },
      resolve: null,
      text: "Unearth {2}",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: {
        filter: { subtype: "Sliver", type: "creature" },
        keywords: [{ keyword: "unearth", cost: "{2}" }],
      },
      text: "Each Sliver creature card in your graveyard has unearth {2}.",
    },
  ],
});
