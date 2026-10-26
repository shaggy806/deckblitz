import { defineCard } from "../define.js";

// EDHREC rank 16554.

const STATIC_TEXT = "Each creature you control with a +1/+1 counter on it has trample.";

export default defineCard({
  name: "Crowned Ceratok",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${STATIC_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["trample"],
      text: STATIC_TEXT,
    },
  ],
});
