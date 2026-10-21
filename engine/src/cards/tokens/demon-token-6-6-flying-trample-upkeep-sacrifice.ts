import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice another creature. If you can't, this token deals 6 damage to you.";

/** 6/6 black Demon with flying, trample and an upkeep sacrifice — Rite of Belzenlok's. */
export default defineCard({
  name: "6/6 Black Demon Token (Flying, Trample, Upkeep Sacrifice)",
  art: "73b858b5-803b-4bcf-99d6-8c20c8b37f07",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exceptSource: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: { kind: "damage", amount: 6, who: "you" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
