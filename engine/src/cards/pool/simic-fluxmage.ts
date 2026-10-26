import { defineCard } from "../define.js";

const EVOLVE_FILTER = {
  type: "creature",
  anyOf: [
    { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
    { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
  ],
} as const;

export default defineCard({
  name: "Simic Fluxmage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 2,
  text: "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\n{1}{U}, {T}: Move a +1/+1 counter from this creature onto target creature.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "move-counters", from: "source", to: 0, counter: "+1/+1" },
      resolve: null,
      text: "{1}{U}, {T}: Move a +1/+1 counter from this creature onto target creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: EVOLVE_FILTER },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: EVOLVE_FILTER },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)",
    },
  ],
});
