import { defineCard } from "../define.js";

const EVOLVE_FILTER = {
  type: "creature",
  anyOf: [
    { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
    { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
  ],
} as const;

export default defineCard({
  name: "Simic Manipulator",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Mutant", "Wizard"],
  power: 0,
  toughness: 1,
  text: "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\n{T}, Remove one or more +1/+1 counters from this creature: Gain control of target creature with power less than or equal to the number of +1/+1 counters removed this way.",
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
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "+1/+1", count: "x" } },
      minX: 1,
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: "x" } } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: "{T}, Remove one or more +1/+1 counters from this creature: Gain control of target creature with power less than or equal to the number of +1/+1 counters removed this way.",
    },
  ],
});
