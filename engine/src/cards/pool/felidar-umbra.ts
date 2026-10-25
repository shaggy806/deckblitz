import { defineCard } from "../define.js";

export default defineCard({
  name: "Felidar Umbra",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: "Enchant creature\nEnchanted creature has lifelink.\n{1}{W}: Attach this Aura to target creature you control.\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "{1}{W}: Attach this Aura to target creature you control.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["lifelink"],
      text: "Enchanted creature has lifelink.",
    },
  ],
});
