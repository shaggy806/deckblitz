import { defineCard } from "../define.js";

export default defineCard({
  name: "Scrapwork Cohort",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Soldier"],
  power: 3,
  toughness: 1,
  text: "When this creature enters, create a 1/1 colorless Soldier artifact creature token.\nUnearth {2}{W} ({2}{W}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
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
      text: "Unearth {2}{W}",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Artifact Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 colorless Soldier artifact creature token.",
    },
  ],
});
