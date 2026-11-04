import { defineCard } from "../define.js";

export default defineCard({
  name: "Gnarlid Colony",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{2}{G}" },
  text: "Kicker {2}{G} (You may pay an additional {2}{G} as you cast this spell.)\nIf this creature was kicked, it enters with two +1/+1 counters on it.\nEach creature you control with a +1/+1 counter on it has trample. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: "If this creature was kicked, it enters with two +1/+1 counters on it.",
    },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["trample"],
      text: "Each creature you control with a +1/+1 counter on it has trample.",
    },
  ],
});
