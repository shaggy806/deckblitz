import { defineCard } from "../define.js";

export default defineCard({
  name: "Battlefront Krushok",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 4,
  text: "This creature can't be blocked by more than one creature.\nEach creature you control with a +1/+1 counter on it can't be blocked by more than one creature.",
  static: [
    {
      affects: { scope: "self" },
      blockedByAtMostOne: true,
      text: "This creature can't be blocked by more than one creature.",
    },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      blockedByAtMostOne: true,
      text: "Each creature you control with a +1/+1 counter on it can't be blocked by more than one creature.",
    },
  ],
});
