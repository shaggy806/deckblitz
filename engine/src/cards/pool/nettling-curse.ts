import { defineCard } from "../define.js";

const TEXT = "Whenever enchanted creature attacks or blocks, its controller loses 3 life.";
const ATTACKS = "{1}{R}: Enchanted creature attacks this turn if able.";

export default defineCard({
  name: "Nettling Curse",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}\n${ATTACKS}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "restrict", target: "attached", restrictions: ["must-attack"] },
      resolve: null,
      text: ATTACKS,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
