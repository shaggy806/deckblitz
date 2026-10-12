import { defineCard } from "../define.js";

export default defineCard({
  name: "Elusive Krasis",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Fish", "Mutant"],
  power: 0,
  toughness: 4,
  text: "This creature can't be blocked.\nEvolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)",
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
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
