import { defineCard } from "../define.js";

export default defineCard({
  name: "Restless Apparition",
  manaCost: "{W/B}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: "{W/B}{W/B}{W/B}: This creature gets +3/+3 until end of turn.\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
  activated: [
    {
      cost: { mana: "{W/B}{W/B}{W/B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "{W/B}{W/B}{W/B}: This creature gets +3/+3 until end of turn.",
    },
  ],
  triggered: [
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
