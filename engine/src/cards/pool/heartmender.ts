import { defineCard } from "../define.js";

// EDHREC rank 24890.

export default defineCard({
  name: "Heartmender",
  manaCost: "{2}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: "At the beginning of your upkeep, remove a -1/-1 counter from each creature you control.\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "remove-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "-1/-1",
        amount: 1,
      },
      resolve: null,
      text: "At the beginning of your upkeep, remove a -1/-1 counter from each creature you control.",
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
