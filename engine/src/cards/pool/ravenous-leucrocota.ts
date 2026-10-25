import { defineCard } from "../define.js";

export default defineCard({
  name: "Ravenous Leucrocota",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\n{6}{G}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)",
  activated: [
    {
      cost: { mana: "{6}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: "{6}{G}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)",
    },
  ],
});
