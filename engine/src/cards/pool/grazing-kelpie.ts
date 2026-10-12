import { defineCard } from "../define.js";

export default defineCard({
  name: "Grazing Kelpie",
  manaCost: "{3}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 3,
  text: "{G/U}, Sacrifice this creature: Put target card from a graveyard on the bottom of its owner's library.\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
  activated: [
    {
      cost: { mana: "{G/U}", tap: false, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{G/U}, Sacrifice this creature: Put target card from a graveyard on the bottom of its owner's library.",
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
