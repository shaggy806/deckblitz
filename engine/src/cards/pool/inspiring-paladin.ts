import { defineCard } from "../define.js";

// EDHREC rank 11924.

const SELF_TEXT = "During your turn, this creature has first strike.";
const COUNTERS_TEXT = "During your turn, creatures you control with +1/+1 counters on them have first strike.";

export default defineCard({
  name: "Inspiring Paladin",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: `${SELF_TEXT} (It deals combat damage before creatures without first strike.)\n${COUNTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: SELF_TEXT,
    },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: COUNTERS_TEXT,
    },
  ],
});
