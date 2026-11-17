import { defineCard } from "../define.js";

// Each Room's unlocked doors count (rule 709.5c), one Room's two included.
const PT_TEXT = "This creature gets +3/+0 as long as there are two or more unlocked doors among Rooms you control.";

export default defineCard({
  name: "Rampaging Soulrager",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 4,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "unlocked-doors", filter: { subtype: "Room", controlledBy: "you" } },
        compare: { op: "gte", n: 2 },
      },
      grantPt: [3, 0],
      text: PT_TEXT,
    },
  ],
});
