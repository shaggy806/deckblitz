import { defineCard } from "../define.js";

// EDHREC rank 12071.

export default defineCard({
  name: "Laid to Rest",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever a Human you control dies, draw a card.\nWhenever a creature you control with a +1/+1 counter on it dies, you gain 2 life.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Human" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a Human you control dies, draw a card.",
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "Whenever a creature you control with a +1/+1 counter on it dies, you gain 2 life.",
    },
  ],
});
