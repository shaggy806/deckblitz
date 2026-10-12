import { defineCard } from "../define.js";

export default defineCard({
  name: "Grixis Slavedriver",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 4,
  toughness: 4,
  text: "When this creature leaves the battlefield, create a 2/2 black Zombie creature token.\nUnearth {3}{B} ({3}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
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
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: "When this creature leaves the battlefield, create a 2/2 black Zombie creature token.",
    },
  ],
});
