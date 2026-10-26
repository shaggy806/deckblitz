import { defineCard } from "../define.js";

// EDHREC rank 16886.

const TRIGGER_TEXT = "Whenever another creature leaves the battlefield, you may have target player mill two cards.";
const UNEARTH_TEXT =
  "Unearth {2}{B} ({2}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)";

export default defineCard({
  name: "Extractor Demon",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}\n${UNEARTH_TEXT}`,
  activated: [
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
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have the target player mill two cards?",
        effect: { kind: "mill", target: 0, amount: 2 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
