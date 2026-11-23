import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). A Food Clue with only these abilities:
// the subtypes give it none of their own. X is the counters on it as it was
// sacrificed (its last-known information, rule 608.2h).
const SAC_TEXT =
  "{2}, Sacrifice Simic Slaw: Draw X cards and gain X life, where X is the number of charge counters on Simic Slaw.";
const X = { countersOn: "source", counter: "charge" } as const;

export default defineCard({
  name: "Simic Slaw",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food", "Clue"],
  text: `Whenever one or more creatures die, put a charge counter on Simic Slaw.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: X },
          { kind: "gain-life", amount: X },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, batched: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "Whenever one or more creatures die, put a charge counter on Simic Slaw.",
    },
  ],
});
