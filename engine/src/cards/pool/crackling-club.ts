import { defineCard } from "../define.js";

const PT_TEXT = "Enchanted creature gets +1/+0.";
const SAC_TEXT = "Sacrifice this Aura: It deals 1 damage to target creature.";

export default defineCard({
  name: "Crackling Club",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PT_TEXT}\n${SAC_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: PT_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
