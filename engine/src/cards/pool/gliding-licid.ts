import { defineCard } from "../define.js";

// EDHREC rank 30758.

export default defineCard({
  name: "Gliding Licid",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Licid"],
  power: 2,
  toughness: 2,
  text: "{U}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {U} to end this effect.\nEnchanted creature has flying.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{U}" },
      resolve: null,
      text: "{U}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {U} to end this effect.",
      licid: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
  ],
});
