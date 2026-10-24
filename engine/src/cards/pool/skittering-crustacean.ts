import { defineCard } from "../define.js";

// "As long as this creature is monstrous" is a `source` condition on the
// `monstrous` filter clause (rule 701.37b).
const MONSTROSITY_TEXT =
  "{6}{U}: Monstrosity 4. (If this creature isn't monstrous, put four +1/+1 counters on it and it becomes monstrous.)";
const MONSTROUS_TEXT =
  "As long as this creature is monstrous, it has hexproof. (It can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "Skittering Crustacean",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab"],
  power: 2,
  toughness: 3,
  text: `${MONSTROSITY_TEXT}\n${MONSTROUS_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}{U}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 4 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["hexproof"],
      text: MONSTROUS_TEXT,
    },
  ],
});
