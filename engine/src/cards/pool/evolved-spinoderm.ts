import { defineCard } from "../define.js";

// Rulings:
//   [2023-02-04] If Evolved Spinoderm somehow loses all of its oil counters due to an effect other
//     than its upkeep triggered ability, this won't cause its controller to sacrifice it until the
//     next time its upkeep triggered ability resolves.
//
// Archfiend of the Dross's remove-then-check upkeep, sacrificing instead of
// losing; the check isn't gated on a counter having come off (the ruling).
// The two keyword statics are Arixmethes's `self-counters` condition, split
// at two.

const OIL_TEXT = "This creature enters with four oil counters on it.";
const KEYWORD_TEXT =
  "This creature has trample as long as it has two or fewer oil counters on it. Otherwise, it has hexproof.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, remove an oil counter from this creature. Then if it has no oil counters on it, sacrifice it.";

export default defineCard({
  name: "Evolved Spinoderm",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 5,
  toughness: 5,
  text: `${OIL_TEXT}\n${KEYWORD_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 4 } },
      text: OIL_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "oil", compare: { op: "lte", n: 2 } },
      grantKeywords: ["trample"],
      text: KEYWORD_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 3 } },
      grantKeywords: ["hexproof"],
      text: KEYWORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "oil", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "oil", compare: { op: "eq", n: 0 } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
