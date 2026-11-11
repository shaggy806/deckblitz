import { defineCard } from "../define.js";

// Rulings:
//   A creature that's both a Zombie and a Mutant will get +X/+X only once from Hancock's first ability.

const ANTHEM =
  "Each other creature you control that's a Zombie or Mutant gets +X/+X, where X is the number of counters on Hancock.";
const UNDYING =
  "Undying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)";

export default defineCard({
  name: "Hancock, Ghoulish Mayor",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Mutant", "Advisor"],
  power: 2,
  toughness: 1,
  text: `${ANTHEM}\n${UNDYING}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Zombie", "Mutant"], isSource: false },
      },
      grantPtPerCount: { anyCountersOnSource: true, pt: [1, 1] },
      text: ANTHEM,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UNDYING,
    },
  ],
});
