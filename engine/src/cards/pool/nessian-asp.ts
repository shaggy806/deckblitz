import { defineCard } from "../define.js";

const MONSTROSITY_TEXT =
  "{6}{G}: Monstrosity 4. (If this creature isn't monstrous, put four +1/+1 counters on it and it becomes monstrous.)";

export default defineCard({
  name: "Nessian Asp",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 4,
  toughness: 5,
  keywords: ["reach"],
  text: `Reach\n${MONSTROSITY_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 4 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
});
