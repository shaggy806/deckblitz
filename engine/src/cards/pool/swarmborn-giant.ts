import { defineCard } from "../define.js";

const SAC_TEXT = "When you're dealt combat damage, sacrifice this creature.";

export default defineCard({
  name: "Swarmborn Giant",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 6,
  toughness: 6,
  text: `${SAC_TEXT}\n{4}{G}{G}: Monstrosity 2. (If this creature isn't monstrous, put two +1/+1 counters on it and it becomes monstrous.)\nAs long as this creature is monstrous, it has reach.`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "you", combat: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 2 },
      resolve: null,
      text: "{4}{G}{G}: Monstrosity 2.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { monstrous: true } },
      grantKeywords: ["reach"],
      text: "As long as this creature is monstrous, it has reach.",
    },
  ],
});
