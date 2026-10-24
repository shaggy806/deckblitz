import { defineCard } from "../define.js";

// "As long as this creature is monstrous" is a `source` condition on the
// `monstrous` filter clause (rule 701.37b).
const MONSTROSITY_TEXT =
  "{10}: Monstrosity 10. (If this creature isn't monstrous, put ten +1/+1 counters on it and it becomes monstrous.)";
const MONSTROUS_TEXT =
  "As long as this creature is monstrous, it has trample and can attack as though it didn't have defender.";

export default defineCard({
  name: "Colossus of Akros",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 10,
  toughness: 10,
  keywords: ["defender", "indestructible"],
  text: `Defender, indestructible\n${MONSTROSITY_TEXT}\n${MONSTROUS_TEXT}`,
  activated: [
    {
      cost: { mana: "{10}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 10 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["trample"],
      canAttackAsThoughNoDefender: true,
      text: MONSTROUS_TEXT,
    },
  ],
});
