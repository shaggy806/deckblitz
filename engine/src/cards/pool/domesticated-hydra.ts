import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 18811.
export default defineCard({
  name: "Domesticated Hydra",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 3,
  toughness: 3,
  text: "{X}{G}{G}{G}: Monstrosity X. (If this creature isn't monstrous, put X +1/+1 counters on it and it becomes monstrous.)\nAs long as this creature is monstrous, it has trample.",
  activated: [
    {
      cost: { mana: "{X}{G}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: "x" },
      resolve: null,
      text: "{X}{G}{G}{G}: Monstrosity X.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["trample"],
      text: "As long as this creature is monstrous, it has trample.",
    },
  ],
});
