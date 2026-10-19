import { defineCard } from "../define.js";

export default defineCard({
  name: "Most Wanted",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature gets +2/+1.\nWhen enchanted creature dies, create two Treasure tokens.",
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Enchanted creature gets +2/+1." }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 2 },
      resolve: null,
      text: "When enchanted creature dies, create two Treasure tokens.",
    },
  ],
});
