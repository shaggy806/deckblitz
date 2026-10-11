import { defineCard } from "../define.js";

// EDHREC rank 14632.
const TEXT =
  "Each creature you control with a +1/+1 counter on it has menace. (It can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Great Ugly-Looking Goblin",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["menace"],
      text: "Each creature you control with a +1/+1 counter on it has menace.",
    },
  ],
  faces: ["Great Ugly-Looking Goblin", "Clap! Snap!"],
  adventure: true,
});
