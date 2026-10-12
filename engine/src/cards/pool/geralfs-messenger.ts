import { defineCard } from "../define.js";

export default defineCard({
  name: "Geralf's Messenger",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 2,
  text: "This creature enters tapped.\nWhen this creature enters, target opponent loses 2 life.\nUndying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, target opponent loses 2 life.",
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
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
});
