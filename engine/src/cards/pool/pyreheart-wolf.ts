import { defineCard } from "../define.js";

export default defineCard({
  name: "Pyreheart Wolf",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature attacks, creatures you control gain menace until end of turn. (They can't be blocked except by two or more creatures.)\nUndying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature attacks, creatures you control gain menace until end of turn.",
    },
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
      text: "Undying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
    },
  ],
});
