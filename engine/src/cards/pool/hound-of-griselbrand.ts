import { defineCard } from "../define.js";

export default defineCard({
  name: "Hound of Griselbrand",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Dog"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: "Double strike\nUndying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
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
      text: "Undying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
    },
  ],
});
