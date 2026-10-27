import { defineCard } from "../define.js";

export default defineCard({
  name: "Elephant Guide",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +3/+3.\nWhen enchanted creature dies, create a 3/3 green Elephant creature token.",
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Elephant Token", count: 1 },
      resolve: null,
      text: "When enchanted creature dies, create a 3/3 green Elephant creature token.",
    },
  ],
});
