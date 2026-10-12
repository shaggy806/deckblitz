import { defineCard } from "../define.js";

export default defineCard({
  name: "Fire-Field Ogre",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  subtypes: ["Ogre", "Mutant"],
  power: 4,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\nUnearth {U}{B}{R} ({U}{B}{R}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{U}{B}{R}", tap: false },
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
      text: "Unearth {U}{B}{R}",
    },
  ],
});
