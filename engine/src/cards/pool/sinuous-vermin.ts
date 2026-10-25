import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 19882.
export default defineCard({
  name: "Sinuous Vermin",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Horror"],
  power: 2,
  toughness: 2,
  text: "{3}{B}{B}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)\nAs long as this creature is monstrous, it has menace. (It can't be blocked except by two or more creatures.)",
  activated: [
    {
      cost: { mana: "{3}{B}{B}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: "{3}{B}{B}: Monstrosity 3.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["menace"],
      text: "As long as this creature is monstrous, it has menace.",
    },
  ],
});
