import { defineCard } from "../define.js";

const PUMP = "Enchanted creature gets +3/+3 and attacks each combat if able.";
const DIES = "When enchanted creature dies, this Aura deals 3 damage to that creature's controller.";

export default defineCard({
  name: "Impending Doom",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}\n${DIES}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], restrictions: ["must-attack"], text: PUMP }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: DIES,
    },
  ],
});
