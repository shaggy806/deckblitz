import { defineCard } from "../define.js";

// EDHREC rank 22438. Abzan Falconer's static.

const TEXT = "Each creature you control with a +1/+1 counter on it has flying.";

export default defineCard({
  name: "Sapphire Drake",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
