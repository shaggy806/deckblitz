import { defineCard } from "../define.js";

export default defineCard({
  name: "Hagra Constrictor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 0,
  toughness: 0,
  text: "This creature enters with two +1/+1 counters on it.\nEach creature you control with a +1/+1 counter on it has menace. (A creature with menace can't be blocked except by two or more creatures.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["menace"],
      text: "Each creature you control with a +1/+1 counter on it has menace.",
    },
  ],
});
