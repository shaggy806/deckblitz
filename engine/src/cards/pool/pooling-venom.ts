import { defineCard } from "../define.js";

const TAPPED = "Whenever enchanted land becomes tapped, its controller loses 2 life.";
const DESTROY = "{3}{B}: Destroy enchanted land.";

export default defineCard({
  name: "Pooling Venom",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TAPPED}\n${DESTROY}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TAPPED,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [],
      effect: { kind: "destroy", target: "attached" },
      resolve: null,
      text: DESTROY,
    },
  ],
});
