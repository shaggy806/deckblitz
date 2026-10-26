import { defineCard } from "../define.js";

// EDHREC rank 22942.
//
// Rulings:
//   [2012-05-01] The comparison of power is performed only when blockers are declared.

const EVASION = "Creatures with power less than this creature's power can't block it.";
const UNDYING =
  "Undying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)";

export default defineCard({
  name: "Howlgeist",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit", "Wolf"],
  power: 4,
  toughness: 2,
  text: `${EVASION}\n${UNDYING}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: EVASION,
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
