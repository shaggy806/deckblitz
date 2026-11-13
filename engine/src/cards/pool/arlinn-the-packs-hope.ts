import { defineCard } from "../define.js";

// Innistrad: Midnight Hunt (MID). EDHREC rank 9012.
//
// The +1 is two effects that last until your next turn and outlast Arlinn
// (rule 611.2): a flash permission for your creature spells, and a replacement
// over creatures entering under your control (rule 614.1c), each with one more
// +1/+1 counter as it enters.

const PLUS_TEXT =
  "+1: Until your next turn, you may cast creature spells as though they had flash, and each creature you control enters with an additional +1/+1 counter on it.";
const MINUS_TEXT = "−3: Create two 2/2 green Wolf creature tokens.";

export default defineCard({
  name: "Arlinn, the Pack's Hope",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Arlinn"],
  loyalty: 4,
  keywords: ["daybound"],
  text: `Daybound (If a player casts no spells during their own turn, it becomes night next turn.)\n${PLUS_TEXT}\n${MINUS_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "player-effect", duration: "until-your-next-turn", castAsThoughFlash: { filter: { type: "creature" } } },
          {
            kind: "replacement-effect",
            duration: "until-your-next-turn",
            replacement: {
              event: "others-enter-battlefield",
              filter: { type: "creature", controlledBy: "you" },
              counters: { kind: "+1/+1", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 2 },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
  faces: ["Arlinn, the Pack's Hope", "Arlinn, the Moon's Fury"],
  transform: true,
});
