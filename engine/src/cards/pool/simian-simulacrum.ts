import { defineCard } from "../define.js";

export default defineCard({
  name: "Simian Simulacrum",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Ape"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, put two +1/+1 counters on target creature you control.\nUnearth {2}{G}{G} ({2}{G}{G}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: false },
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
      text: "Unearth {2}{G}{G}",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "When this creature enters, put two +1/+1 counters on target creature you control.",
    },
  ],
});
