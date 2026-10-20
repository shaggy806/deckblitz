import { defineCard } from "../define.js";

// EDHREC rank 11545. Modern Horizons 2.
//
// Adapt 1 puts nothing on it while it has a +1/+1 counter (its ruling), so
// re-adapting doesn't fire the double strike trigger.
export default defineCard({
  name: "Knighted Myr",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Myr", "Knight"],
  power: 2,
  toughness: 2,
  text: "{2}{W}: Adapt 1. (If this creature has no +1/+1 counters on it, put a +1/+1 counter on it.)\nWhenever one or more +1/+1 counters are put on this creature, it gains double strike until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "{2}{W}: Adapt 1. (If this creature has no +1/+1 counters on it, put a +1/+1 counter on it.)",
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever one or more +1/+1 counters are put on this creature, it gains double strike until end of turn.",
    },
  ],
});
