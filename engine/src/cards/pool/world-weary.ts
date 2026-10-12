import { defineCard } from "../define.js";

export default defineCard({
  name: "World-Weary",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  cycling: { cost: "{1}{B}", search: { supertype: "basic", type: "land" } },
  text: "Enchant creature\nEnchanted creature gets -4/-4.\nBasic landcycling {1}{B} ({1}{B}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-4, -4],
      text: "Enchanted creature gets -4/-4.",
    },
  ],
});
