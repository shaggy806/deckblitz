import { defineCard } from "../define.js";

// "As long as this creature is monstrous" is a `source` condition on the
// `monstrous` filter clause (rule 701.37b).
const MONSTROSITY_TEXT =
  "{3}{B}{B}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";
const MONSTROUS_TEXT =
  "As long as this creature is monstrous, it has menace. (It can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Sinuous Vermin",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Horror"],
  power: 2,
  toughness: 2,
  text: `${MONSTROSITY_TEXT}\n${MONSTROUS_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{B}{B}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["menace"],
      text: MONSTROUS_TEXT,
    },
  ],
});
