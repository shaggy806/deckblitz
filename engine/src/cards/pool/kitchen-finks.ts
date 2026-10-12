import { defineCard } from "../define.js";

export default defineCard({
  name: "Kitchen Finks",
  manaCost: "{1}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, you gain 2 life.\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "When this creature enters, you gain 2 life.",
    },
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "-1/-1", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: "Persist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
    },
  ],
});
