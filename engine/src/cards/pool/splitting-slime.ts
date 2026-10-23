import { defineCard } from "../define.js";

// The token copies the Slime's copiable values only (rule 707.2): no
// counters, not monstrous (the ruling), so its own monstrosity makes another.
export default defineCard({
  name: "Splitting Slime",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 3,
  toughness: 3,
  text: "{4}{G}{G}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)\nWhen this creature becomes monstrous, create a token that's a copy of this creature. (The token has no counters and isn't monstrous.)",
  activated: [
    {
      cost: { mana: "{4}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: "{4}{G}{G}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1 },
      resolve: null,
      text: "When this creature becomes monstrous, create a token that's a copy of this creature. (The token has no counters and isn't monstrous.)",
    },
  ],
});
