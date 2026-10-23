import { defineCard } from "../define.js";

// "As long as this creature is monstrous" is a `source` condition on the
// `monstrous` filter clause (rule 701.37b).
const MONSTROSITY_TEXT =
  "{X}{G}{G}{G}: Monstrosity X. (If this creature isn't monstrous, put X +1/+1 counters on it and it becomes monstrous.)";
const MONSTROUS_TEXT =
  "As long as this creature is monstrous, it has trample.";

export default defineCard({
  name: "Domesticated Hydra",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 3,
  toughness: 3,
  text: `${MONSTROSITY_TEXT}\n${MONSTROUS_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{G}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: "x" },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["trample"],
      text: MONSTROUS_TEXT,
    },
  ],
});
