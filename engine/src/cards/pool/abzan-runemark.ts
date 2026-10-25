import { defineCard } from "../define.js";

export default defineCard({
  name: "Abzan Runemark",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2.\nEnchanted creature has vigilance as long as you control a black or green permanent.",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." },
    {
      affects: { scope: "attached" },
      condition: { kind: "controls", filter: { anyOf: [{ colors: ["B"] }, { colors: ["G"] }] }, atLeast: 1 },
      grantKeywords: ["vigilance"],
      text: "Enchanted creature has vigilance as long as you control a black or green permanent.",
    },
  ],
});
