import { defineCard } from "../define.js";

const END_TEXT = "At the beginning of your end step, put a +1/+1 counter on each creature that attacked this turn.";
const SAC_TEXT = "Sacrifice this enchantment: Creatures you control gain hexproof and indestructible until end of turn.";
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Lightshield Array",
  art: "https://cards.scryfall.io/art_crop/back/1/1/11798730-6788-4e0b-a828-b46cab1a4fa7.jpg",
  colors: ["W"],
  types: ["enchantment"],
  text: `${END_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", attackedThisTurn: true },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: YOURS, keyword: "hexproof", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  faces: ["Invasion of Gobakhan", "Lightshield Array"],
  transform: true,
});
