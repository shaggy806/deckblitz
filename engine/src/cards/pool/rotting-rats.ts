import { defineCard } from "../define.js";

// Conflux (CON).
//
// Each player discards at once (Miasmic Mummy's shape). Unearth is Combat
// Courier's graveyard ability.

const ENTERS = "When this creature enters, each player discards a card.";

export default defineCard({
  name: "Rotting Rats",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Rat"],
  power: 1,
  toughness: 1,
  text: `${ENTERS}\nUnearth {1}{B} ({1}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
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
      text: "Unearth {1}{B}",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: ENTERS,
    },
  ],
});
