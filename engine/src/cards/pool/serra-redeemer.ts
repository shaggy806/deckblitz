import { defineCard } from "../define.js";

// EDHREC rank 9015.
//
// Rulings:
//   [2022-09-09] Serra Redeemer's second ability checks the power of a creature only at the
//     moment it enters the battlefield. If it enters with counters, those counters are included.
//     If that creature's power is less than 2 when it enters the battlefield but becomes greater
//     than 2 after the ability triggers, you will still put two counters on it.
//
// The power clause is the trigger's filter alone (no intervening-if), so a
// creature that has grown since still gets its counters.
const TEXT =
  "Whenever another creature you control with power 2 or less enters, put two +1/+1 counters on that creature.";

export default defineCard({
  name: "Serra Redeemer",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "lte", n: 2 } },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
