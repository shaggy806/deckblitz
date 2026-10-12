import { defineCard } from "../define.js";

export default defineCard({
  name: "Undead Leotau",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cat"],
  power: 3,
  toughness: 4,
  text: "{R}: This creature gets +1/-1 until end of turn.\nUnearth {2}{B} ({2}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/-1 until end of turn.",
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
