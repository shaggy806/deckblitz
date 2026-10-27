import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 22726. Gaea's Embrace's shape,
// with flash.

export default defineCard({
  name: "Serpent Skin",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature gets +1/+1.\n{G}: Regenerate enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "{G}: Regenerate enchanted creature.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});
