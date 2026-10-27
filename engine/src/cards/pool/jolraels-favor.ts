import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 26090.

export default defineCard({
  name: "Jolrael's Favor",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\n{1}{G}: Regenerate enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "{1}{G}: Regenerate enchanted creature.",
    },
  ],
});
