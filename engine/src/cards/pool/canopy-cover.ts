import { defineCard } from "../define.js";

export default defineCard({
  name: "Canopy Cover",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't be blocked except by creatures with flying or reach.\nEnchanted creature can't be the target of spells or abilities your opponents control.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: [{ kind: "cant-be-blocked", by: { notKeyword: "flying", anyOf: [{ notKeyword: "reach" }] } }],
      text: "Enchanted creature can't be blocked except by creatures with flying or reach.",
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "be-targeted", object: { hostOfSource: true }, by: "opponents" }],
      text: "Enchanted creature can't be the target of spells or abilities your opponents control.",
    },
  ],
});
