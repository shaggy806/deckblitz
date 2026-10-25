import { defineCard } from "../define.js";

// EDHREC rank 29279.

const PUMP_TEXT = "This creature gets +3/+3 as long as you control a creature with three or more level counters on it.";

export default defineCard({
  name: "Champion's Drake",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "controls",
        filter: { type: "creature", counters: { kind: "level", compare: { op: "gte", n: 3 } } },
        atLeast: 1,
        countsSelf: true,
      },
      grantPt: [3, 3],
      text: PUMP_TEXT,
    },
  ],
});
