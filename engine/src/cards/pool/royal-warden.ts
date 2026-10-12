import { defineCard } from "../define.js";

export default defineCard({
  name: "Royal Warden",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 3,
  toughness: 2,
  text: "Phalanx Commander — When this creature enters, create two tapped 2/2 black Necron Warrior artifact creature tokens.\nUnearth {3}{B} ({3}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
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
      text: "Unearth {3}{B}",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Necron Warrior Token", count: 2, tapped: true },
      resolve: null,
      text: "Phalanx Commander — When this creature enters, create two tapped 2/2 black Necron Warrior artifact creature tokens.",
    },
  ],
});
