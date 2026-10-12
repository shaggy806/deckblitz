import { defineCard } from "../define.js";

export default defineCard({
  name: "War Squeak",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, target creature an opponent controls can't block this turn.\nEnchanted creature gets +1/+1 and has haste.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "When this Aura enters, target creature an opponent controls can't block this turn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["haste"],
      text: "Enchanted creature gets +1/+1 and has haste.",
    },
  ],
});
