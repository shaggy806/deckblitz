import { defineCard } from "../define.js";

export default defineCard({
  name: "Mardu Runemark",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2.\nEnchanted creature has first strike as long as you control a white or black permanent.",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." },
    {
      affects: { scope: "attached" },
      condition: {
        kind: "controls",
        filter: { anyOf: [{ colors: ["W"] }, { colors: ["B"] }] },
        atLeast: 1,
        countsSelf: true,
      },
      grantKeywords: ["first-strike"],
      text: "Enchanted creature has first strike as long as you control a white or black permanent.",
    },
  ],
});
