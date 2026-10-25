import { defineCard } from "../define.js";

// EDHREC rank 11820.

export default defineCard({
  name: "Crab Umbra",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: "Enchant creature\n{2}{U}: Untap enchanted creature.\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: "{2}{U}: Untap enchanted creature.",
    },
  ],
});
