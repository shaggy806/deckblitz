import { defineCard } from "../define.js";

export default defineCard({
  name: "Senseless Rage",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  madness: { cost: "{1}{R}" },
  text: "Enchant creature\nEnchanted creature gets +2/+2.\nMadness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
});
