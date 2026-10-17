import { defineCard } from "../define.js";

// EDHREC rank 22700.

const PUMP_TEXT = "As long as you control a Goblin or Orc, this creature gets +1/+0.";

export default defineCard({
  name: "Snarling Warg",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtypes: ["Goblin", "Orc"] }, atLeast: 1 },
      grantPt: [1, 0],
      text: PUMP_TEXT,
    },
  ],
});
