import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 26408.
//
// "If your opponents control no creatures" is an intervening-if (rule
// 603.4): checked as the upkeep begins and again as the trigger resolves.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, if your opponents control no creatures, this creature deals 4 damage to you.";

export default defineCard({
  name: "Kezzerdrix",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rabbit", "Beast"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: `First strike\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "not",
        of: { kind: "opponents-control-total", filter: { type: "creature" }, atLeast: 1 },
      },
      targets: [],
      effect: { kind: "damage", amount: 4, who: "you" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
