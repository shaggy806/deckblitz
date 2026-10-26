import { defineCard } from "../define.js";

// EDHREC rank 28692.

export default defineCard({
  name: "Corrupting Licid",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Licid"],
  power: 2,
  toughness: 2,
  text: "{B}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {B} to end this effect.\nEnchanted creature has fear. (It can't be blocked except by artifact creatures and/or black creatures.)",
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{B}" },
      resolve: null,
      text: "{B}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {B} to end this effect.",
      licid: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["fear"],
      text: "Enchanted creature has fear.",
    },
  ],
});
