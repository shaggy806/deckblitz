import { defineCard } from "../define.js";

// EDHREC rank 12498.
//
// Rulings:
//   [2012-07-01] The +1/+1 counter is put on Slumbering Dragon before blockers are declared. This
//     may allow Slumbering Dragon to "wake up" and block the creature that attacked and caused its
//     ability to trigger.
//   [2012-07-01] Slumbering Dragon's third ability will trigger once for each creature that
//     attacks you or a planeswalker you control.
//   [2012-07-01] Slumbering Dragon's second ability counts all +1/+1 counters on it, not just the
//     ones added by its third ability.
//
// The restriction counts every +1/+1 counter on it (`self-counters`), and
// the trigger is Thantis, the Warweaver's — once per attacker.

const RESTRICT_TEXT = "This creature can't attack or block unless it has five or more +1/+1 counters on it.";
const TRIGGER_TEXT =
  "Whenever a creature attacks you or a planeswalker you control, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Slumbering Dragon",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${RESTRICT_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 5 } },
      },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
