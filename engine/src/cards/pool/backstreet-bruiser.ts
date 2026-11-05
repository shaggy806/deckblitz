import { defineCard } from "../define.js";

// EDHREC rank 26710. Individual counters of any kind, on any creatures you
// control (the ruling).
const TEXT =
  "As long as there are two or more counters among creatures you control, this creature can attack as though it didn't have defender.";

export default defineCard({
  name: "Backstreet Bruiser",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "counters", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 2 },
        countsSelf: true,
      },
      canAttackAsThoughNoDefender: true,
      text: TEXT,
    },
  ],
});
