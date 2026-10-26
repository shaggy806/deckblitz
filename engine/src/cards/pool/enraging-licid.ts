import { defineCard } from "../define.js";

// EDHREC rank 28804.

export default defineCard({
  name: "Enraging Licid",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Licid"],
  power: 1,
  toughness: 1,
  text: "{R}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {R} to end this effect.\nEnchanted creature has haste.",
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{R}" },
      resolve: null,
      text: "{R}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {R} to end this effect.",
      licid: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["haste"],
      text: "Enchanted creature has haste.",
    },
  ],
});
