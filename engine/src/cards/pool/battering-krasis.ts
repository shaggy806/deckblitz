import { defineCard } from "../define.js";

export default defineCard({
  name: "Battering Krasis",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Shark", "Beast"],
  power: 2,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample\nEvolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: {
          type: "creature",
          anyOf: [
            { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
            { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
          ],
        },
      },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "trigger-object",
          filter: {
            type: "creature",
            anyOf: [
              { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
              { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
            ],
          },
        },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)",
    },
  ],
});
