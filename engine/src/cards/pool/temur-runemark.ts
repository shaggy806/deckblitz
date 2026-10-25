import { defineCard } from "../define.js";

export default defineCard({
  name: "Temur Runemark",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2.\nEnchanted creature has trample as long as you control a blue or red permanent.",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." },
    {
      affects: { scope: "attached" },
      condition: { kind: "controls", filter: { anyOf: [{ colors: ["U"] }, { colors: ["R"] }] }, atLeast: 1 },
      grantKeywords: ["trample"],
      text: "Enchanted creature has trample as long as you control a blue or red permanent.",
    },
  ],
});
